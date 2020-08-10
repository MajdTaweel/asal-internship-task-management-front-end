import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserWithFullName} from '../../../../models/user.model';
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
  dataSource: MatTableDataSource<UserWithFullName>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  private usersSubscription: Subscription;

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.usersSubscription = this.userService.getAllUsers().subscribe(users => {
      this.dataSource = new MatTableDataSource(users.map(user => {
        return {...user, fullName: `${user.firstName} ${user.lastName}`};
      }));
      this.dataSource.sort = this.sort;
    });
  }

  ngOnDestroy(): void {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }
}
