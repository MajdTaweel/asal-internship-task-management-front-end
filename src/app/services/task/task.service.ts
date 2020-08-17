import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Task} from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private httpClient: HttpClient) {
  }

  getTasksByReleaseId(releaseId: string): Observable<Task> {
    return this.httpClient.get<Task>(`${environment.apiURL}release/${releaseId}/tasks`);
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
}
