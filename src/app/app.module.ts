import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {HttpClientModule} from '@angular/common/http';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {NavComponent} from './components/nav/nav.component';
import {FooterComponent} from './components/footer/footer.component';
import {JwtModule} from '@auth0/angular-jwt';
import {environment} from '../environments/environment';
import {MatDialogModule} from '@angular/material/dialog';
import {AlertComponent} from './components/alert/alert.component';
import {HasAnyAuthorityDirective} from './directives/has-any-authority/has-any-authority.directive';

export function tokenGetter(): string {
  return localStorage.getItem('id_token');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    NavComponent,
    FooterComponent,
    AlertComponent,
    HasAnyAuthorityDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatCardModule,
    NgbModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    JwtModule.forRoot({
      config: {
        tokenGetter,
        allowedDomains: environment.allowedDomains,
      },
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
