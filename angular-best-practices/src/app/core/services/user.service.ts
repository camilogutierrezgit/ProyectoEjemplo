import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { User, CreateUserDto } from '../models/user.model';

const API_BASE_URL = 'http://localhost:5000/api';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly _users$ = new BehaviorSubject<User[]>([]);
  public readonly users$ = this._users$.asObservable();

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_BASE_URL}/users`).pipe(
      tap(users => this._users$.next(users)),
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error('Failed to load users. Please try again.'));
      })
    );
  }

  addUser(userDto: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${API_BASE_URL}/users`, userDto).pipe(
      tap(newUser => this._users$.next([...this._users$.getValue(), newUser])),
      catchError(error => {
        console.error('Error adding user:', error);
        return throwError(() => new Error('Failed to add user. Please try again.'));
      })
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/users/${id}`).pipe(
      tap(() => this._users$.next(this._users$.getValue().filter(u => u.id !== id))),
      catchError(error => {
        console.error('Error deleting user:', error);
        return throwError(() => new Error('Failed to delete user. Please try again.'));
      })
    );
  }
}
