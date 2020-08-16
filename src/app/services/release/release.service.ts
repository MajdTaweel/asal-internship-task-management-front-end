import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Release} from '../../models/release.model';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Role} from '../../models/user.model';
import {UserService} from '../user/user.service';

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
}
