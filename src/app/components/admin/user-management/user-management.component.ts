import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {User, UserAlt} from '../../../models/user.model';
import {UserService} from '../../../services/user/user.service';
import {Observable, of, Subscription} from 'rxjs';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {UserEditComponent} from '../dialogs/user-edit/user-edit.component';
import {switchMap, tap} from 'rxjs/operators';
import {AlertService} from '../../../services/alert/alert.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  displayedColumns = ['login', 'fullName', 'email', 'activated', 'authorities', 'actions'];
  dataSource: MatTableDataSource<UserAlt>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  private subscriptions = new Subscription();
  private updatedUserSubscription: Subscription;
  private deletedUserSubscription: Subscription;
  private usersSubscription: Subscription;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private alertService: AlertService
  ) {
  }

  ngOnInit(): void {
    this.usersSubscription = this.getUsers().subscribe(users => {
      this.dataSource = new MatTableDataSource(users.map(user => new UserAlt(user)));
      this.dataSource.sort = this.sort;
    });
  }

  onCreateUser(): void {
    this.createUser();
  }

  onViewUser(event: MouseEvent, user: UserAlt): void {
    event.stopPropagation();
    this.displayUserEditDialog(false, user);
  }

  onEditUser(event: MouseEvent, user: UserAlt): void {
    event.stopPropagation();
    this.updateUser(user);
  }

  onDeleteUser(event: MouseEvent, user: UserAlt): void {
    event.stopPropagation();
    this.checkConfirmationThenDelete(user);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.updatedUserSubscription) {
      this.updatedUserSubscription.unsubscribe();
    }
    if (this.deletedUserSubscription) {
      this.deletedUserSubscription.unsubscribe();
    }
  }

  private createUser(): void {
    if (this.updatedUserSubscription) {
      this.updatedUserSubscription.unsubscribe();
    }
    const dialogRef = this.displayUserEditDialog(true);
    this.updatedUserSubscription = this.getUpdatedUserAfterUserEditDialogClosed(dialogRef)
      .subscribe(_ => this.updateUsersList());
  }

  private updateUser(user: UserAlt): void {
    if (this.updatedUserSubscription) {
      this.updatedUserSubscription.unsubscribe();
    }
    const dialogRef = this.displayUserEditDialog(true, user);
    this.updatedUserSubscription = this.getUpdatedUserAfterUserEditDialogClosed(dialogRef)
      .subscribe(_ => this.updateUsersList());
  }

  private updateUsersList(): void {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
    this.usersSubscription = this.getUsers().subscribe(users => {
      this.dataSource.data = users.map(user => new UserAlt(user));
      this.dataSource._updateChangeSubscription();
    });
  }

  private getUsers(): Observable<User[]> {
    return this.userService.getAllUsers().pipe(tap(users => console.log('All users', users)));
  }

  private displayUserEditDialog(isEdit?: boolean, user?: UserAlt): MatDialogRef<UserEditComponent> {
    return this.dialog.open(
      UserEditComponent,
      {
        data: {
          user,
          isEdit,
        },
      },
    );
  }

  private getUpdatedUserAfterUserEditDialogClosed(dialogRef: MatDialogRef<UserEditComponent>): Observable<User> {
    return dialogRef.afterClosed().pipe(tap((updatedUser: User) => {
      if (updatedUser) {
        this.replaceOldUserObjectWithUpdatedUserObject(updatedUser);
        console.log('User updated', updatedUser);
      }
    }));
  }

  private replaceOldUserObjectWithUpdatedUserObject(updatedUser: User): void {
    const oldUserIndex = this.dataSource.data.findIndex(oldUser => oldUser.id === updatedUser.id);
    this.dataSource.data.fill(new UserAlt(updatedUser), oldUserIndex, oldUserIndex + 1);
    this.dataSource._updateChangeSubscription();
  }

  private deleteUser(user: UserAlt): Observable<null> {
    return this.userService.deleteUser(user.login)
      .pipe(tap(_ => {
        this.updateUsersList();
        console.log('User deleted', user);
      }));
  }

  private checkConfirmationThenDelete(user: UserAlt): void {
    if (this.deletedUserSubscription) {
      this.deletedUserSubscription.unsubscribe();
    }
    this.deletedUserSubscription = this.alertService
      .displayDeleteConfirmationDialog(`User "${user.login}" will be permanently deleted. Continue deletion?`)
      .pipe(switchMap(confirmed => {
        if (confirmed) {
          return this.deleteUser(user);
        }
        return of(null);
      }))
      .subscribe();
  }
}
