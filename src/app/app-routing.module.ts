import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {UserManagementComponent} from './components/admin/user-management/user-management.component';
import {AdminGuard} from './guards/admin/admin.guard';
import {HomeComponent} from './components/home/home.component';
import {AuthGuard} from './guards/auth/auth.guard';
import {AnonymousGuard} from './guards/anonymous/anonymous.guard';
import {TaskManagementComponent} from './components/task-management/task-management.component';
import {TaskGuard} from './guards/task/task.guard';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AnonymousGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AnonymousGuard],
  },
  {
    path: 'admin/user-management',
    component: UserManagementComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'release/:releaseId/task-management',
    component: TaskManagementComponent,
    canActivate: [AuthGuard, TaskGuard],
  },
  {
    path: '**',
    redirectTo: ''
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
