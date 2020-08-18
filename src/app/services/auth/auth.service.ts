import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {catchError, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Router} from '@angular/router';
import {AlertService} from '../alert/alert.service';

interface RegisterParams {
  email: string;
  firstName: string;
  lastName: string;
  login: string;
  password: string;
  passwordConfirmation: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenChange = new BehaviorSubject<string>(null);
  private loginSubscription: Subscription;

  constructor(
    private httpClient: HttpClient,
    private jwtHelperService: JwtHelperService,
    private alertService: AlertService,
    private router: Router,
  ) {
  }

  logIn(username: string, password: string): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
    this.loginSubscription = this.httpClient.post<{ id_token }>(
      `${environment.apiURL}authenticate`,
      {
        username,
        password,
        rememberMe: true,
      }
    ).pipe(
      tap(token => this.storeUsernameAndToken(username, token.id_token)),
      catchError(error => of(this.handleLoginException(error)))
    ).subscribe();
  }

  register(registerParams: RegisterParams): void {
    this.httpClient.post(
      `${environment.apiURL}register`,
      {...registerParams, langKey: 'en', passwordConfirmation: undefined}
    ).pipe(
      tap(_ => this.logIn(registerParams.login, registerParams.password))
    ).subscribe();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('id_token')?.length
      && !this.jwtHelperService.isTokenExpired(localStorage.getItem('id_token'));
  }

  logOut(): void {
    this.emptyUsernameAndToken();
    this.navigateToLogin().then(value => console.log('Navigated to login after logging out', value));
  }

  get tokenChanges(): Observable<string> {
    return this.tokenChange.asObservable();
  }

  private storeUsernameAndToken(username: string, token: string): void {
    localStorage.setItem('username', username);
    localStorage.setItem('id_token', token);
    this.tokenChange.next(username);
    console.log('JWT:', token);
  }

  private handleLoginException(error: any): null {
    this.emptyUsernameAndToken();
    this.presentLoginErrorDialog(error);
    return null;
  }

  private emptyUsernameAndToken(): void {
    localStorage.removeItem('username');
    localStorage.removeItem('id_token');
    this.tokenChange.next(null);
  }

  private presentLoginErrorDialog(error: any): void {
    console.log(error);
    if (!!error?.error?.detail) {
      this.openAlertDialog(error.error.title, error.error.detail);
    } else {
      this.openAlertDialog('Something Went Wrong', 'Please check your internet connection.');
    }
  }

  private openAlertDialog(title: string, message: string): void {
    this.alertService.displaySimpleAlertDialog(title, message);
  }

  private navigateToLogin(): Promise<boolean> {
    return this.router.navigate(['/', 'login']);
  }
}
