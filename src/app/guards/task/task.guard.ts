import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {UserService} from '../../services/user/user.service';
import {map, switchMap} from 'rxjs/operators';
import {Role} from '../../models/user.model';
import {ReleaseService} from '../../services/release/release.service';

@Injectable({
  providedIn: 'root'
})
export class TaskGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router,
    private releaseService: ReleaseService,
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userService.isUserInitialized.pipe(switchMap(user => {
      const releaseId = next.paramMap.get('releaseId');
      if (releaseId?.length) {
        return this.releaseService.getRelease(releaseId)
          .pipe(map(release => {
            if (release) {
              if (this.userService.hasAnyAuthority(Role.ADMIN.toString())) {
                return true;
              } else if (release.team?.length) {
                return !!release.team.find(member => member.login === user.login);
              }
            }
            return false;
          }));
      }
      return of(false);
    }));
  }
}
