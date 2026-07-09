import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskDto, Page, TaskStatus } from '../models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private http: HttpClient) {}

  // ADMIN only — fetches all tasks in the system, with optional filters
  getAllTasks(page: number = 0, size: number = 10, status?: TaskStatus, ownerUuid?: string): Observable<Page<TaskDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);
    if (ownerUuid) params = params.set('owner', ownerUuid);

    return this.http.get<Page<TaskDto>>(`${environment.apiUrl}/tasks`, { params });
  }

  // Any authenticated user — fetches only the current user's own tasks
  getMyTasks(page: number = 0, size: number = 10, status?: TaskStatus): Observable<Page<TaskDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);

    return this.http.get<Page<TaskDto>>(`${environment.apiUrl}/tasks/my`, { params });
  }

  getTaskById(uuid: string): Observable<TaskDto> {
    return this.http.get<TaskDto>(`${environment.apiUrl}/tasks/${uuid}`);
  }

  createTask(task: TaskDto): Observable<TaskDto> {
    return this.http.post<TaskDto>(`${environment.apiUrl}/tasks`, task);
  }

  updateTask(uuid: string, task: TaskDto): Observable<TaskDto> {
    return this.http.put<TaskDto>(`${environment.apiUrl}/tasks/${uuid}`, task);
  }

  deleteTask(uuid: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/tasks/${uuid}`);
  }
}
