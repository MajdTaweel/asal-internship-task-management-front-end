import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {ReleaseService} from '../../services/release/release.service';
import {Release} from '../../models/release.model';
import {Observable, of, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {AlertService} from '../../services/alert/alert.service';
import {ReleaseEditComponent} from '../dialogs/release-edit/release-edit.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  releases: Observable<Release[]>;
  subscriptions = new Subscription();

  constructor(
    private userService: UserService,
    private releaseService: ReleaseService,
    private dialog: MatDialog,
    private alertService: AlertService,
  ) {
  }

  ngOnInit(): void {
    this.updateReleasesList();
  }

  isReleaseOwnerOrAdmin(createdBy: string): Observable<boolean> {
    return this.releaseService.isReleaseOwnerOrAdmin(createdBy);
  }

  onViewRelease(release: Release): void {
    this.displayReleaseEditDialog(false, release);
  }

  onCreateRelease(): void {
    this.displayReleaseEditDialog(true);
  }

  onEditRelease(release: Release): void {
    this.displayReleaseEditDialog(true, release);
  }

  onDeleteRelease(release: Release): void {
    const sub = this.checkConfirmationThenDelete(release).subscribe();
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
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
    this.releases = this.getReleases();
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
