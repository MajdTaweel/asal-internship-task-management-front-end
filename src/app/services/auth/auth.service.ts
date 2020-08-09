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
    ).pipe(tap(token => {
        localStorage.setItem('username', username);
        localStorage.setItem('id_token', token.id_token);
        this.tokenChange.next(username);
        console.log('JWT:', token.id_token);
      }),
      catchError(err => {
        let dialogRef: MatDialogRef<AlertComponent>;
        if (err.status === 401 || err.status === 403 || err.status === 404) {
          dialogRef = this.dialog.open(AlertComponent, {
            data: {title: 'Wrong Credentials', message: 'Incorrect username or password.'}
          });
        } else {
          dialogRef = this.dialog.open(AlertComponent, {
            data: {title: 'Connection Error', message: 'Error connecting. Please check your internet connection.'}
          });
        }
        localStorage.removeItem('username');
        localStorage.removeItem('id_token');
        this.tokenChange.next(null);
        return of(dialogRef);
      })
    ).subscribe();
  }

  register(registerParams: RegisterParams): void {
    this.httpClient.post(
      `${environment.apiURL}register`,
      {...registerParams, langKey: 'en', passwordConfirmation: undefined}
    ).pipe(tap(_ => this.logIn(registerParams.login, registerParams.password))).subscribe();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('id_token')?.length
      && !this.jwtHelperService.isTokenExpired(localStorage.getItem('id_token'));
  }

  get tokenChanges(): Observable<string> {
    return this.tokenChange.asObservable();
  }
}
