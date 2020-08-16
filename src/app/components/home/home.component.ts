import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {ReleaseService} from '../../services/release/release.service';
import {Release} from '../../models/release.model';
import {Observable, of, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {AlertService} from '../../services/alert/alert.service';

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

  onDisplayReleaseEditDialog(): void {
    // this.releaseService.createRelease(new Release(
    //   null,
    //   'New Release',
    //   'Test Release',
    //   (new Date()),
    //   ReleaseStatus.NEW,
    // )).subscribe(release => {
    //   console.log('Created release', release);
    //   this.updateReleasesList();
    // });
  }

  isReleaseOwnerOrAdmin(createdBy: string): Observable<boolean> {
    return this.releaseService.isReleaseOwnerOrAdmin(createdBy);
  }

  onEditRelease(id: string): void {
  }

  onDeleteRelease(id: string): void {
    const sub = this.checkConfirmationThenDelete(id).subscribe();
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getReleases(): Observable<Release[]> {
    return this.releaseService.getReleases().pipe(tap(releases => console.log('My releases', releases)));
  }

  private checkConfirmationThenDelete(id: string): Observable<null> {
    return this.alertService
      .displayDeleteConfirmationDialog('Release will be permanently deleted. Continue deletion?')
      .pipe(switchMap(confirmed => {
        if (confirmed) {
          return this.deleteRelease(id);
        }
        return of(null);
      }));
  }

  private deleteRelease(id: string): Observable<null> {
    return this.releaseService.deleteRelease(id).pipe(tap(_ => {
      this.updateReleasesList();
      console.log(`Release with id: ${id} deleted`);
    }));
  }

  private updateReleasesList(): void {
    this.releases = this.getReleases();
  }
}
