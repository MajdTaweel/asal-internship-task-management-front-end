import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Task} from '../../models/task.model';
import {map} from 'rxjs/operators';
import {Role} from '../../models/user.model';
import {UserService} from '../user/user.service';

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

  isTaskOwnerOrAdmin(createdBy: string): Observable<boolean> {
    return this.userService.currentUser
      .pipe(map(user => this.userService.hasAnyAuthority(Role.ADMIN) || user?.login === createdBy));
  }
}
