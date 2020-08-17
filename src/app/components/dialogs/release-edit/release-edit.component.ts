import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Release, ReleaseStatus} from '../../../models/release.model';
import {Subscription} from 'rxjs';
import {ReleaseService} from '../../../services/release/release.service';
import {tap} from 'rxjs/operators';

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
  private isNewRelease: boolean;

  constructor(
    private dialogRef: MatDialogRef<ReleaseEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      release?: Release,
      isEdit?: boolean,
    },
    private releaseService: ReleaseService,
  ) {
  }

  ngOnInit(): void {
    this.releaseEditForm.setValue(this.data?.release);
    this.isNewRelease = this.data?.isEdit && !this.data?.release;
  }

  onUpdateRelease(): void {
    if (this.releaseEditForm.valid) {
      this.updateRelease();
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
}
