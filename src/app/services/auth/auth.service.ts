import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {catchError, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {JwtHelperService} from '@auth0/angular-jwt';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AlertComponent} from '../../components/alert/alert.component';

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
    private dialog: MatDialog,
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

  get tokenChanges(): Observable<string> {
    return this.tokenChange.asObservable();
  }

  private storeUsernameAndToken(username: string, token: string): void {
    localStorage.setItem('username', username);
    localStorage.setItem('id_token', token);
    this.tokenChange.next(username);
    console.log('JWT:', token);
  }

  private handleLoginException(error: any): MatDialogRef<AlertComponent> {
    this.emptyUsernameAndToken();
    return this.presentLoginErrorDialog(error);
  }

  private emptyUsernameAndToken(): void {
    localStorage.removeItem('username');
    localStorage.removeItem('id_token');
    this.tokenChange.next(null);
  }

  private presentLoginErrorDialog(error: any): MatDialogRef<AlertComponent> {
    if (error.status === 401 || error.status === 403 || error.status === 404) {
      return this.openAlertDialog('Wrong Credentials', 'Incorrect username or password.');
    } else {
      return this.openAlertDialog('Connection Error', 'Error connecting. Please check your internet connection.');
    }
  }

  private openAlertDialog(title: string, message: string): MatDialogRef<AlertComponent> {
    return this.dialog.open(AlertComponent, {data: {title, message}});
  }
}
