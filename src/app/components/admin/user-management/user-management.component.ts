import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Role, UserAlt} from '../../../../models/user.model';
import {UserService} from '../../../services/user/user.service';
import {Subscription} from 'rxjs';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['login', 'fullName', 'email', 'activated', 'authorities'];
  dataSource: MatTableDataSource<UserAlt>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  private subscriptions = new Subscription();

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    const sub = this.userService.getAllUsers().subscribe(users => {
      this.dataSource = new MatTableDataSource(users.map(user => new UserAlt(user)));
      this.dataSource.sort = this.sort;
    });
    this.subscriptions.add(sub);
  }

  onUpdateUser(user: UserAlt): void {
    const sub = this.userService.updateUser(user).subscribe(updatedUser => console.log('User updated', updatedUser));
    this.subscriptions.add(sub);
  }

  onAddAuthority(user: UserAlt, authority: Role): void {
    user.authorities.push(authority);
    this.onUpdateUser(user);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
