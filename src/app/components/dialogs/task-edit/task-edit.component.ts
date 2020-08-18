import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Observable, Subscription} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Task, TaskStatus} from '../../../models/task.model';
import {TaskService} from '../../../services/task/task.service';
import {Release} from '../../../models/release.model';
import {User} from '../../../models/user.model';
import {MatChipInputEvent} from '@angular/material/chips';
import {map, startWith, tap} from 'rxjs/operators';
import {MatAutocomplete, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss']
})
export class TaskEditComponent implements OnInit, OnDestroy {
  taskEditForm = new FormGroup({
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
    description: new FormControl(
      {
        value: '',
        disabled: !this.data?.isEdit,
      },
      [
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
        value: TaskStatus.NEW,
        disabled: !this.data?.isEdit || !this.data?.task,
      },
      Validators.required,
    ),
    assignees: new FormControl(
      {
        value: [],
        disabled: !this.data?.isEdit,
      },
    ),
    releaseId: new FormControl(
      {
        value: '',
        disabled: true,
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
  isNewTask: boolean;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  assigneeControl = new FormControl({
    value: '',
    disabled: !this.data?.isEdit,
  });
  @ViewChild('assigneeInput') assigneeInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  filteredTeamMembers: Observable<User[]>;
  private updateSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<TaskEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      task?: Task,
      release?: Release,
      isEdit?: boolean,
    },
    private taskService: TaskService,
  ) {
    this.retrieveFilteredTeamMembers();
  }

  ngOnInit(): void {
    this.isNewTask = this.data?.isEdit && !this.data?.task;
    if (!this.isNewTask) {
      this.taskEditForm.setValue(this.data.task);
      this.taskEditForm.get('assignees').setValue([...this.data.task.assignees]);
    } else {
      this.taskEditForm.get('assignees').setValue([]);
      this.taskEditForm.get('releaseId').setValue(this.data?.release?.id);
    }
  }

  onUpdateTask(): void {
    if (this.taskEditForm.valid) {
      this.updateTask();
    }
  }

  onRemoveAssignee(index: number): void {
    const assignees: User[] = this.taskEditForm.value?.assignees;
    if (!assignees?.length) {
      return;
    }
    assignees.splice(index, 1);
  }

  onAddAssignee(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      const user = this.getUserObject(value);
      if (user) {
        this.taskEditForm.value?.assignees?.push(user);
        console.log(this.taskEditForm.value);
      }
    }

    if (input) {
      input.value = '';
    }
  }

  onAssigneeSelected(event: MatAutocompleteSelectedEvent): void {
    this.taskEditForm.value?.assignees?.push(event.option.value);
    this.assigneeInput.nativeElement.value = '';
    this.assigneeControl.setValue(null);
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  private getTaskObject(): Task {
    this.taskEditForm.enable();
    const task: Task = this.taskEditForm.value;
    this.taskEditForm.disable();
    return task;
  }

  private updateTask(): void {
    const task = this.getTaskObject();
    const operation = this.isNewTask
      ? this.taskService.createTask(task)
      : this.taskService.updateTask(task);
    this.updateSubscription = operation
      .pipe(tap(updatedTask => this.dismissDialogWithUpdatedTask(updatedTask)))
      .subscribe();
  }

  private dismissDialogWithUpdatedTask(task: Task): void {
    this.dialogRef.close(task);
  }

  private getUserObject(username: string): User {
    return this.data?.release?.team?.find(member => member.login === username);
  }

  private retrieveFilteredTeamMembers(): void {
    this.filteredTeamMembers = this.assigneeControl.valueChanges.pipe(
      startWith(null),
      map((value: string | User) => {
        if (value) {
          if (typeof value === 'string') {
            return this.filterTeamMembers(value);
          } else if (typeof value === 'object') {
            return this.filterTeamMembers(value.login);
          }
        }
        return this.data?.release?.team?.slice();
      }));
  }

  private filterTeamMembers(value: string): User[] {
    const filterValue = value?.toLowerCase();

    return this.data?.release?.team?.filter(member => member?.login.toLowerCase().indexOf(filterValue) === 0);
  }
}
