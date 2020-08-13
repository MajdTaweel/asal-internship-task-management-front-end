import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {User, UserAlt} from '../../../../../models/user.model';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../../services/user/user.service';
import {tap} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit, OnDestroy {
  userEditForm = new FormGroup({
    id: new FormControl(
      {
        value: '',
        disabled: true,
      },
    ),
    email: new FormControl(
      {
        value: '',
        disabled: !this?.data?.isEdit,
      },
      [
        Validators.required,
        Validators.email,
      ],
    ),
    firstName: new FormControl(
      {
        value: '',
        disabled: !this?.data?.isEdit,
      },
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ],
    ),
    lastName: new FormControl(
      {
        value: '',
        disabled: !this?.data?.isEdit,
      },
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ],
    ),
    login: new FormControl(
      {
        value: '',
        disabled: !this?.data?.isEdit,
      },
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'),
      ],
    ),
    activated: new FormControl(
      {
        value: false,
        disabled: !this?.data?.isEdit,
      },
    ),
    authorities: new FormControl(
      {
        value: '',
        disabled: !this?.data?.isEdit,
      },
      [
        Validators.required,
      ],
    ),
    langKey: new FormControl(
      {
        value: '',
        disabled: !this?.data?.isEdit,
      },
      [
        Validators.required,
      ],
    ),
    imageUrl: new FormControl(
      {
        value: '',
        disabled: !this?.data?.isEdit,
      },
    ),
    createdBy: new FormControl(
      {
        value: '',
        disabled: true,
      },
    ),
    createdDate: new FormControl(
      {
        value: '',
        disabled: true,
      },
    ),
    lastModifiedBy: new FormControl(
      {
        value: '',
        disabled: true,
      },
    ),
    lastModifiedDate: new FormControl(
      {
        value: '',
        disabled: true,
      },
    ),
  });
  private updateSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<UserEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      user: UserAlt;
      isEdit?: boolean;
      buttons?: { text: string, handler: () => void }[];
    },
    private userService: UserService,
  ) {
  }

  ngOnInit(): void {
    const user = {...this.data.user};
    delete user.fullName;
    this.userEditForm.setValue(user);
  }

  onUpdateUser(): void {
    if (this.userEditForm.valid) {
      this.userEditForm.enable();
      const user: User = this.userEditForm.value;
      this.userEditForm.disable();
      this.updateSubscription = this.userService.updateUser(user)
        .pipe(tap(updatedUser => this.dismissDialogWithUpdatedUser(updatedUser)))
        .subscribe();
    }
  }

  dismissDialogWithUpdatedUser(user: User): void {
    this.dialogRef.close(user);
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }
}
