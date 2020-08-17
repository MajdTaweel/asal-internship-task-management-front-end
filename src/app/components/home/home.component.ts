import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {ReleaseService} from '../../services/release/release.service';
import {Release} from '../../models/release.model';
import {Observable, of, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {AlertService} from '../../services/alert/alert.service';
import {ReleaseEditComponent} from '../dialogs/release-edit/release-edit.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  displayedColumns = ['title', 'type', 'deadline', 'status', 'team', 'actions'];
  dataSource: MatTableDataSource<Release>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  private releasesSubscription: Subscription;
  private subscriptions = new Subscription();

  constructor(
    private userService: UserService,
    private releaseService: ReleaseService,
    private dialog: MatDialog,
    private alertService: AlertService,
  ) {
  }

  ngOnInit(): void {
    this.releasesSubscription = this.getReleases().subscribe(releases => {
      this.dataSource = new MatTableDataSource(releases);
      this.dataSource.sort = this.sort;
    });
  }

  isReleaseOwnerOrAdmin(createdBy: string): Observable<boolean> {
    return this.releaseService.isReleaseOwnerOrAdmin(createdBy);
  }

  onViewRelease(event: MouseEvent, release: Release): void {
    event.stopPropagation();
    this.displayReleaseEditDialog(false, release);
  }

  onCreateRelease(): void {
    this.displayReleaseEditDialog(true);
  }

  onEditRelease(event: MouseEvent, release: Release): void {
    event.stopPropagation();
    this.displayReleaseEditDialog(true, release);
  }

  onDeleteRelease(event: MouseEvent, release: Release): void {
    event.stopPropagation();
    const sub = this.checkConfirmationThenDelete(release).subscribe();
    this.subscriptions.add(sub);
  }

  onViewReleaseIfAuthorized(event: MouseEvent, release: Release): void {
    const sub = this.isReleaseOwnerOrAdmin(release.createdBy)
      .subscribe(isAuthorized => isAuthorized && this.onViewRelease(event, release));
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    if (this.releasesSubscription) {
      this.releasesSubscription.unsubscribe();
    }
    this.subscriptions.unsubscribe();
  }

  private getReleases(): Observable<Release[]> {
    return this.releaseService.getReleases().pipe(tap(releases => console.log('My releases', releases)));
  }

  private checkConfirmationThenDelete(release: Release): Observable<null> {
    return this.alertService
      .displayDeleteConfirmationDialog('Release will be permanently deleted. Continue deletion?')
      .pipe(switchMap(confirmed => {
        if (confirmed) {
          return this.deleteRelease(release);
        }
        return of(null);
      }));
  }

  private deleteRelease(release: Release): Observable<null> {
    return this.releaseService.deleteRelease(release.id).pipe(tap(_ => {
      this.updateReleasesList();
      console.log('Release deleted', release);
    }));
  }

  private updateReleasesList(): void {
    if (this.releasesSubscription) {
      this.releasesSubscription.unsubscribe();
    }
    this.releasesSubscription = this.getReleases().subscribe(releases => {
      this.dataSource.data = releases;
      this.dataSource._updateChangeSubscription();
    });
  }

  private displayReleaseEditDialog(isEdit?: boolean, release?: Release): void {
    this.dialog.open(ReleaseEditComponent, {
      data: {
        release,
        isEdit,
      },
    });
  }
}
