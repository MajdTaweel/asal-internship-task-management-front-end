import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Release, ReleaseStatus} from '../../../models/release.model';
import {Observable, of, Subscription} from 'rxjs';
import {ReleaseService} from '../../../services/release/release.service';
import {catchError, tap} from 'rxjs/operators';
import {User} from '../../../models/user.model';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {UserService} from '../../../services/user/user.service';
import {AlertComponent} from '../alert/alert.component';

@Component({
  selector: 'app-release-edit',
  templateUrl: './release-edit.component.html',
  styleUrls: ['./release-edit.component.scss']
})
export class ReleaseEditComponent implements OnInit, OnDestroy {
  releaseEditForm = new FormGroup({
    id: new FormControl(
      {
        value: null,
        disabled: true,
      },
    ),
    title: new FormControl(
      {
        value: '',
        disabled: !this.data?.isEdit,
      },
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255),
      ],
    ),
    type: new FormControl(
      {
        value: '',
        disabled: !this.data?.isEdit,
      },
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255),
      ],
    ),
    deadline: new FormControl(
      {
        value: '',
        disabled: !this.data?.isEdit,
      },
      [
        Validators.required,
        Validators.min((new Date()).getMilliseconds())
      ],
    ),
    status: new FormControl(
      {
        value: ReleaseStatus.NEW,
        disabled: !this.data?.isEdit || !this.data?.release,
      },
      Validators.required,
    ),
    team: new FormControl(
      {
        value: [],
        disabled: !this.data?.isEdit || !this.data?.release,
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
  isNewRelease: boolean;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  private updateSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<ReleaseEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      release?: Release,
      isEdit?: boolean,
    },
    private releaseService: ReleaseService,
    private userService: UserService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.isNewRelease = this.data?.isEdit && !this.data?.release;
    if (!this.isNewRelease) {
      this.releaseEditForm.setValue(this.data.release);
      this.releaseEditForm.get('team').setValue([...this.data.release.team]);
    }
  }

  onUpdateRelease(): void {
    if (this.releaseEditForm.valid) {
      this.updateRelease();
    }
  }

  onRemoveTeamMember(index: number): void {
    const team: User[] = this.releaseEditForm.value?.team;
    if (!team?.length) {
      return;
    }
    team.splice(index, 1);
  }

  onAddTeamMember(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.getUserObject(value)
        .subscribe(user => {
          if (user) {
            this.releaseEditForm.value.team.push(user);
          }
        });
    }

    if (input) {
      input.value = '';
    }
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  private getReleaseObject(): Release {
    this.releaseEditForm.enable();
    const release: Release = this.releaseEditForm.value;
    this.releaseEditForm.disable();
    return release;
  }

  private updateRelease(): void {
    const release = this.getReleaseObject();
    const operation = this.isNewRelease
      ? this.releaseService.createRelease(release)
      : this.releaseService.updateRelease(release);
    this.updateSubscription = operation
      .pipe(tap(updatedRelease => this.dismissDialogWithUpdatedRelease(updatedRelease)))
      .subscribe();
  }

  private dismissDialogWithUpdatedRelease(release: Release): void {
    this.dialogRef.close(release);
  }

  private getUserObject(username: string): Observable<User> {
    return this.userService.getUserByUsername(username)
      .pipe(catchError(error => {
        console.log(error);
        this.openAlertDialog(error.error.title, error.error.detail);
        return of(null);
      }));
  }

  private openAlertDialog(title: string, message: string): MatDialogRef<AlertComponent> {
    return this.dialog.open(AlertComponent, {data: {title, message}});
  }
}
