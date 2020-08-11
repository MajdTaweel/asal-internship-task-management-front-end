import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, Subject, Subscription} from 'rxjs';
import {environment} from '../../../environments/environment';
import {map, tap} from 'rxjs/operators';
import {AuthService} from '../auth/auth.service';
import {Role, User} from '../../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user = new BehaviorSubject<User>(null);
  private userSubscription: Subscription;
  private userInitialized = new Subject<User>();
  private userDidInitialize = false;

  constructor(private authService: AuthService, private httpClient: HttpClient) {
    this.authService.tokenChanges.pipe(tap(username => {
      username = username?.length ? username : localStorage.getItem('username');
      console.log('JWT changed, username:', username);
      if (username?.length) {
        if (this.userSubscription) {
          this.userSubscription.unsubscribe();
        }
        this.userSubscription = this.retrieveUser(username).subscribe(user => {
          if (!this.userDidInitialize) {
            this.userInitialized.next(user);
          }
        });
      } else {
        if (!this.userDidInitialize) {
          this.userInitialized.next(null);
        }
        if (this.userSubscription) {
          this.userSubscription.unsubscribe();
          this.userSubscription = null;
        }
      }
    })).subscribe();
  }

  get currentUser(): Observable<User> {
    return this.user.asObservable();
  }

  getAuthenticationState(): Observable<Role[]> {
    return this.currentUser.pipe(map(user => user.authorities));
  }

  hasAnyAuthority(authorities: string[] | string): boolean {
    if (!this.user?.value?.authorities?.length) {
      return false;
    }

    if (!Array.isArray(authorities)) {
      authorities = [authorities];
    }

    const userAuthorities = this.user.value?.authorities?.map(authority => authority?.toString()) || [];
    return userAuthorities.some(authority => authorities.includes(authority));
  }

  getAllUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${environment.apiURL}users`);
  }

  updateUser(user: User): Observable<User> {
    return this.httpClient.put<User>(`${environment.apiURL}users`, user);
  }

  get isUserInitialized(): Observable<User> {
    return this.userDidInitialize ? this.user.asObservable() : this.userInitialized.asObservable();
  }

  private retrieveUser(username: string): Observable<User> {
    if (this.authService.isAuthenticated()) {
      if (this.userSubscription) {
        this.userSubscription.unsubscribe();
      }
      return this.httpClient.get<any>(`${environment.apiURL}users/${username}`)
        .pipe(tap(user => {
          this.user.next(user);
          console.log(user);
        }));
    } else {
      this.user.next(null);
      console.log(`User ${username} is not logged in`);
      return of(null);
    }
  }
}
