import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Release, ReleaseStatus} from '../../models/release.model';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Role} from '../../models/user.model';
import {UserService} from '../user/user.service';

const NEAR_DUE_MIN_DAYS = 3;

@Injectable({
  providedIn: 'root'
})
export class ReleaseService {

  constructor(private httpClient: HttpClient, private userService: UserService) {
  }

  createRelease(release: Release): Observable<Release> {
    return this.httpClient.post<Release>(`${environment.apiURL}releases`, release);
  }

  getReleases(): Observable<Release[]> {
    return this.httpClient.get<Release[]>(`${environment.apiURL}releases`);
  }

  getRelease(id: string): Observable<Release> {
    return this.httpClient.get<Release>(`${environment.apiURL}releases/${id}`);
  }

  deleteRelease(id: string): Observable<null> {
    return this.httpClient.delete<null>(`${environment.apiURL}releases/${id}`);
  }

  updateRelease(release: Release): Observable<Release> {
    return this.httpClient.put<Release>(`${environment.apiURL}releases`, release);
  }

  isReleaseOwnerOrAdmin(createdBy: string): Observable<boolean> {
    return this.userService.currentUser
      .pipe(map(user => this.userService.hasAnyAuthority(Role.ADMIN) || user?.login === createdBy));
  }

  isOverdue(release: Release): boolean {
    if (release.status === ReleaseStatus.DONE) {
      return false;
    }
    let date = release.deadline;
    if (!date) {
      return false;
    }
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return (new Date().valueOf()) >= date.valueOf();
  }

  isAlmostDue(release: Release): boolean {
    if (release.status === ReleaseStatus.DONE) {
      return false;
    }
    let date = release.deadline;
    if (!date) {
      return false;
    }
    if (typeof date === 'string') {
      date = new Date(date);
    }
    const minDays = NEAR_DUE_MIN_DAYS * 24 * 60 * 60 * 1000;
    return date.valueOf() - (new Date().valueOf()) <= minDays;
  }
}
