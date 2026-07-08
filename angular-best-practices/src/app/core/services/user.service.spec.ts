import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User, CreateUserDto } from '../models/user.model';
import { beforeEach, describe, expect, it, afterEach } from 'vitest';
import { firstValueFrom } from 'rxjs';

const API_URL = 'http://localhost:8080/api';

const mockUsers: User[] = [
  { id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', role: 'Admin', isActive: true, avatarUrl: '' },
  { id: 2, firstName: 'Alan', lastName: 'Turing', email: 'alan@example.com', role: 'User', isActive: true, avatarUrl: '' },
];

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no unexpected requests remain
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET users and update users$ state', async () => {
    const usersPromise = firstValueFrom(service.getUsers());

    const req = httpMock.expectOne(`${API_URL}/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);

    const users = await usersPromise;
    expect(users.length).toBe(2);
    expect(users[0].firstName).toBe('Ada');

    // BehaviorSubject should be updated
    const cachedUsers = await firstValueFrom(service.users$);
    expect(cachedUsers.length).toBe(2);
  });

  it('should throw error when GET fails', async () => {
    const usersPromise = firstValueFrom(service.getUsers());

    const req = httpMock.expectOne(`${API_URL}/users`);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    try {
      await usersPromise;
      expect.fail('expected error');
    } catch (e: any) {
      expect(e.message).toContain('Failed to load users');
    }
  });

  it('should POST a new user and update users$ state', async () => {
    // Seed state with existing users first
    const seedPromise = firstValueFrom(service.getUsers());
    httpMock.expectOne(`${API_URL}/users`).flush(mockUsers);
    await seedPromise;

    const newUserDto: CreateUserDto = { firstName: 'Grace', lastName: 'Hopper', email: 'grace@example.com', role: 'Admin', isActive: false, avatarUrl: '' };
    const createdUser: User = { id: 3, ...newUserDto };

    const addPromise = firstValueFrom(service.addUser(newUserDto));
    const req = httpMock.expectOne(`${API_URL}/users`);
    expect(req.request.method).toBe('POST');
    req.flush(createdUser);

    const result = await addPromise;
    expect(result.id).toBe(3);
    expect(result.firstName).toBe('Grace');

    const cachedUsers = await firstValueFrom(service.users$);
    expect(cachedUsers.length).toBe(3);
  });

  it('should DELETE a user and update users$ state', async () => {
    // Seed state first
    const seedPromise = firstValueFrom(service.getUsers());
    httpMock.expectOne(`${API_URL}/users`).flush(mockUsers);
    await seedPromise;

    const deletePromise = firstValueFrom(service.deleteUser(1));
    const req = httpMock.expectOne(`${API_URL}/users/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    await deletePromise;

    const cachedUsers = await firstValueFrom(service.users$);
    expect(cachedUsers.find(u => u.id === 1)).toBeUndefined();
    expect(cachedUsers.length).toBe(1);
  });
});
