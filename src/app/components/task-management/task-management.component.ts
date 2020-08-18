import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Release} from '../../models/release.model';
import {MatSort} from '@angular/material/sort';
import {Observable, of, Subscription} from 'rxjs';
import {UserService} from '../../services/user/user.service';
import {ReleaseService} from '../../services/release/release.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AlertService} from '../../services/alert/alert.service';
import {map, switchMap, tap} from 'rxjs/operators';
import {Task} from '../../models/task.model';
import {TaskService} from '../../services/task/task.service';
import {TaskEditComponent} from '../dialogs/task-edit/task-edit.component';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-task-management',
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.scss']
})
export class TaskManagementComponent implements OnInit, OnDestroy {
  displayedColumns = ['title', 'deadline', 'status', 'assignees', 'actions'];
  dataSource: MatTableDataSource<Task>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  release: Observable<Release>;
  releaseId: string;
  private tasksSubscription: Subscription;
  private viewTaskSubscription: Subscription;
  private updateTaskSubscription: Subscription;
  private deleteTaskSubscription: Subscription;

  constructor(
    private userService: UserService,
    private releaseService: ReleaseService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      this.releaseId = paramMap.get('releaseId');
      if (this.releaseId?.length) {
        this.retrieveRelease(this.releaseId);
      }
    });
  }

  isTaskOwnerOrAssigneeOrAdmin(task: Task): Observable<boolean> {
    return this.taskService.isTaskOwnerOrAssigneeOrAdmin(task);
  }

  onViewTask(event: MouseEvent, task: Task): void {
    event.stopPropagation();
    if (this.viewTaskSubscription) {
      this.viewTaskSubscription.unsubscribe();
    }
    this.viewTaskSubscription = this.displayTaskEditDialog(false, task).subscribe();
  }

  onCreateTask(): void {
    this.createTask();
  }

  onEditTask(event: MouseEvent, task: Task): void {
    event.stopPropagation();
    this.updateTask(task);
  }

  onDeleteTask(event: MouseEvent, task: Task): void {
    event.stopPropagation();
    this.checkConfirmationThenDelete(task);
  }

  isOverdue(task: Task): boolean {
    return this.taskService.isOverdue(task);
  }

  isAlmostDue(task: Task): boolean {
    return this.taskService.isAlmostDue(task);
  }

  ngOnDestroy(): void {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
    if (this.viewTaskSubscription) {
      this.viewTaskSubscription.unsubscribe();
    }
    if (this.updateTaskSubscription) {
      this.updateTaskSubscription.unsubscribe();
    }
    if (this.deleteTaskSubscription) {
      this.deleteTaskSubscription.unsubscribe();
    }
  }

  private getTasks(releaseId: string): Observable<Task[]> {
    return this.taskService.getTasksByReleaseId(releaseId).pipe(tap(tasks => console.log('My tasks', tasks)));
  }

  private checkConfirmationThenDelete(task: Task): void {
    if (this.deleteTaskSubscription) {
      this.deleteTaskSubscription.unsubscribe();
    }
    this.alertService
      .displayDeleteConfirmationDialog('Task will be permanently deleted. Continue deletion?')
      .pipe(switchMap(confirmed => {
        if (confirmed) {
          return this.deleteTask(task);
        }
        return of(null);
      }))
      .subscribe();
  }

  private getUpdatedTaskAfterTaskEditDialogClosed(dialogRef: MatDialogRef<TaskEditComponent>): Observable<Task> {
    return dialogRef.afterClosed().pipe(tap((updatedTask: Task) => {
      if (updatedTask) {
        this.updateTasksList();
        console.log('Task updated', updatedTask);
      }
    }));
  }

  private createTask(): void {
    if (this.updateTaskSubscription) {
      this.updateTaskSubscription.unsubscribe();
    }
    this.updateTaskSubscription = this.displayTaskEditDialog(true)
      .pipe(switchMap(dialogRef => this.getUpdatedTaskAfterTaskEditDialogClosed(dialogRef)))
      .subscribe();
  }

  private updateTask(task: Task): void {
    if (this.updateTaskSubscription) {
      this.updateTaskSubscription.unsubscribe();
    }
    this.updateTaskSubscription = this.displayTaskEditDialog(true, task)
      .pipe(switchMap(dialogRef => this.getUpdatedTaskAfterTaskEditDialogClosed(dialogRef)))
      .subscribe();
  }

  private deleteTask(task: Task): Observable<null> {
    return this.taskService.deleteTask(task.id).pipe(tap(_ => {
      this.updateTasksList();
      console.log('Task deleted', task);
    }));
  }

  private updateTasksList(): void {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
    this.tasksSubscription = this.getTasks(this.releaseId).subscribe(tasks => {
      this.dataSource.data = tasks;
      this.dataSource._updateChangeSubscription();
    });
  }

  private displayTaskEditDialog(isEdit?: boolean, task?: Task): Observable<MatDialogRef<TaskEditComponent>> {
    return this.release.pipe(map(release => {
      return this.dialog.open(TaskEditComponent, {
        data: {
          task,
          release,
          isEdit,
        },
      });
    }));
  }

  private retrieveRelease(releaseId: string): void {
    this.release = this.releaseService.getRelease(releaseId)
      .pipe(tap(release => {
        console.log('Release retrieved', release);
        this.tasksSubscription = this.getTasks(this.releaseId).subscribe(tasks => {
          this.dataSource = new MatTableDataSource(tasks);
          this.dataSource.sort = this.sort;
        });
      }));
  }
}
