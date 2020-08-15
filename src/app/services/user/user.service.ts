import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, Subject, Subscription} from 'rxjs';
import {environment} from '../../../environments/environment';
import {map, tap} from 'rxjs/operators';
import {AuthService} from '../auth/auth.service';
import {Role, User} from '../../models/user.model';
import {Router} from '@angular/router';

function getCurrentUsername(): string {
  return localStorage.getItem('username');
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user = new BehaviorSubject<User>(null);
  private userSubscription: Subscription;
  private userInitialized = new Subject<User>();
  private userDidInitialize = false;

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
    private router: Router,
  ) {
    this.authService.tokenChanges.pipe(
      tap(username => {
        username = username?.length ? username : getCurrentUsername();
        console.log('JWT changed, username:', username);
        if (this.userSubscription) {
          this.userSubscription.unsubscribe();
        }
        this.userSubscription = this.initializeUser(username)
          .pipe(tap(user => {
            if (user) {
              this.navigateToHome()
                .then(value => console.log('Navigated to home after logging in and getting user data', value));
            }
          }))
          .subscribe();
      })
    ).subscribe();
  }

  get currentUser(): Observable<User> {
    return this.user.asObservable();
  }

  get isUserInitialized(): Observable<User> {
    return this.userDidInitialize ? this.user.asObservable() : this.userInitialized.asObservable();
  }

  getAuthenticationState(): Observable<Role[]> {
    return this.currentUser.pipe(map(user => user?.authorities || []));
  }

  hasAnyAuthority(authorities: string[] | string): boolean {
    if (!this.user?.value?.authorities?.length) {
      return (typeof authorities === 'string' && authorities === Role.ANONYMOUS)
        || (Array.isArray(authorities) && authorities.length === 1 && authorities.includes(Role.ANONYMOUS));
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

  deleteUser(username: string): Observable<null> {
    return this.httpClient.delete<null>(`${environment.apiURL}users/${username}`);
  }

  private initializeUser(username: string): Observable<User> {
    if (username?.length) {
      return this.retrieveCurrentUser(username)
        .pipe(tap(user => {
          if (!this.userDidInitialize) {
            this.userInitialized.next(user);
            this.userDidInitialize = true;
          }
        }));
    } else {
      return this.emptyUser()
        .pipe(tap(_ => {
          if (!this.userDidInitialize) {
            this.userInitialized.next(null);
            this.userDidInitialize = true;
          }
        }));
    }
  }

  private retrieveCurrentUser(username: string): Observable<User> {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.authService.isAuthenticated()) {
      return this.getUserByUsername(username)
        .pipe(tap(user => {
          this.user.next(user);
          console.log('Current user', user);
          return user;
        }));
    } else {
      console.log(`User ${username} is not logged in`);
      return this.emptyUser();
    }
  }

  private getUserByUsername(username: string): Observable<User> {
    return this.httpClient.get<User>(`${environment.apiURL}users/${username}`);
  }

  private emptyUser(): Observable<null> {
    this.user.next(null);
    return of(null);
  }

  private navigateToHome(): Promise<boolean> {
    return this.router.navigate(['/']);
  }
}
