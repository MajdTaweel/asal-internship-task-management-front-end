import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Role, User, UserAlt} from '../../../../models/user.model';
import {UserService} from '../../../services/user/user.service';
import {Observable, Subscription} from 'rxjs';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {UserEditComponent} from '../dialogs/user-edit/user-edit.component';
import {tap} from 'rxjs/operators';

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

  constructor(private userService: UserService, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    const sub = this.userService.getAllUsers().subscribe(users => {
      this.dataSource = new MatTableDataSource(users.map(user => new UserAlt(user)));
      this.dataSource.sort = this.sort;
    });
    this.subscriptions.add(sub);
  }

  onUpdateUser(user: User): void {
    const sub = this.userService.updateUser(user).subscribe(updatedUser => console.log('User updated', updatedUser));
    this.subscriptions.add(sub);
  }

  onAddAuthority(user: UserAlt, authority: Role): void {
    user.authorities.push(authority);
    this.onUpdateUser(user);
  }

  onViewUser(user: UserAlt): void {
    this.dialog.open(
      UserEditComponent,
      {
        data: {
          user,
        },
      },
    );
  }

  onEditUser(user: UserAlt): void {
    if (this.updatedUserSubscription) {
      this.updatedUserSubscription.unsubscribe();
    }
    const dialogRef = this.displayUserEditDialog(user);
    this.updatedUserSubscription = this.getUpdatedUserAfterUserEditDialogCloses(dialogRef).subscribe();
  }

  onDeleteUser(user: UserAlt): void {
    this.userService.deleteUser(user.login).subscribe(deletedUser => {
      this.removeDeletedUserObject(user);
      console.log('User deleted', deletedUser);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.updatedUserSubscription) {
      this.updatedUserSubscription.unsubscribe();
    }
  }

  private displayUserEditDialog(user: UserAlt): MatDialogRef<UserEditComponent> {
    return this.dialog.open(
      UserEditComponent,
      {
        data: {
          user,
          isEdit: true,
        },
      },
    );
  }

  private getUpdatedUserAfterUserEditDialogCloses(dialogRef: MatDialogRef<UserEditComponent>): Observable<User> {
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

  private removeDeletedUserObject(user: UserAlt): void {
    const deletedUserIndex = this.dataSource.data.findIndex(deletedUser => deletedUser.id === user.id);
    this.dataSource.data.splice(deletedUserIndex, 1);
    this.dataSource._updateChangeSubscription();
  }
}
