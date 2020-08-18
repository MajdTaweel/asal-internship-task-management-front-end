import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Task, TaskStatus} from '../../models/task.model';
import {map} from 'rxjs/operators';
import {Role} from '../../models/user.model';
import {UserService} from '../user/user.service';

const NEAR_DUE_MIN_DAYS = 3;

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private httpClient: HttpClient, private userService: UserService) {
  }

  getTasksByReleaseId(releaseId: string): Observable<Task[]> {
    return this.httpClient.get<Task[]>(`${environment.apiURL}release/${releaseId}/tasks`);
  }

  createTask(task: Task): Observable<Task> {
    return this.httpClient.post<Task>(`${environment.apiURL}tasks`, task);
  }

  updateTask(task: Task): Observable<Task> {
    return this.httpClient.put<Task>(`${environment.apiURL}tasks`, task);
  }

  deleteTask(id: string): Observable<null> {
    return this.httpClient.delete<null>(`${environment.apiURL}tasks/${id}`);
  }

  isTaskOwnerOrAssigneeOrAdmin(task: Task): Observable<boolean> {
    return this.userService.currentUser
      .pipe(map(user => {
        if (this.userService.hasAnyAuthority(Role.ADMIN) || user?.login === task?.createdBy) {
          return true;
        } else {
          return !!task?.assignees?.find(assignee => assignee?.login === user?.login);
        }
      }));
  }

  isOverdue(task: Task): boolean {
    if (task.status === TaskStatus.DONE) {
      return false;
    }
    let date = task.deadline;
    if (!date) {
      return false;
    }
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return (new Date().valueOf()) >= date.valueOf();
  }

  isAlmostDue(task: Task): boolean {
    if (task.status === TaskStatus.DONE) {
      return false;
    }
    let date = task.deadline;
    if (!date) {
      return false;
    }
    if (typeof date === 'string') {
      date = new Date(date);
    }
    const minDays = NEAR_DUE_MIN_DAYS * 24 * 60 * 60 * 1000;
    return date.valueOf() - (new Date().valueOf()) <= minDays;
  }
}
