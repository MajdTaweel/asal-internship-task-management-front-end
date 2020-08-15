import {Component, OnInit} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {ReleaseService} from '../../services/release/release.service';
import {Release, ReleaseStatus} from '../../models/release.model';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {Role} from '../../models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  releases: Observable<Release[]>;

  constructor(
    private userService: UserService,
    private releaseService: ReleaseService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.releases = this.getReleases();
  }

  onDisplayReleaseEditDialog(): void {
    this.releaseService.createRelease(new Release(
      null,
      'New Release',
      'Test Release',
      (new Date()),
      ReleaseStatus.NEW,
    )).subscribe(release => {
      console.log('Created release', release);
      this.releases = this.getReleases();
    });
  }

  isReleaseOwnerOrAdmin(createdBy: string): Observable<boolean> {
    return this.userService.currentUser
      .pipe(map(user => this.userService.hasAnyAuthority(Role.ADMIN) || user.login === createdBy));
  }

  onEditRelease(id: string): void {
  }

  onDeleteRelease(id: string): void {
  }

  private getReleases(): Observable<Release[]> {
    return this.releaseService.getReleases().pipe(tap(releases => console.log('My releases', releases)));
  }
}
