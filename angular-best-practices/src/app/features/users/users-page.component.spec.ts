import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersPageComponent } from './users-page.component';
import { UserService } from '../../core/services/user.service';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

describe('UsersPageComponent', () => {
  let component: UsersPageComponent;
  let fixture: ComponentFixture<UsersPageComponent>;
  let mockUserService: any;

  beforeEach(async () => {
    mockUserService = {
      users$: of([]),
      getUsers: () => of([]),
      addUser: () => of({}),
      deleteUser: () => of(true)
    };

    await TestBed.configureTestingModule({
      imports: [UsersPageComponent],
      providers: [
        { provide: UserService, useValue: mockUserService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    // using spyOn dynamically to support jasmine and vitest compatibility if spyOn is available
    let called = false;
    mockUserService.getUsers = () => {
      called = true;
      return of([]);
    };
    component.loadUsers();
    expect(called).toBeTruthy();
    expect(component.isLoading).toBeFalsy();
  });

  it('should handle error on load users', () => {
    mockUserService.getUsers = () => throwError(() => new Error('Error!'));
    component.loadUsers();
    expect(component.errorMessage).toBe('Error!');
    expect(component.isLoading).toBeFalsy();
  });

  it('should save user', () => {
    let called = false;
    mockUserService.addUser = () => {
      called = true;
      return of({});
    };
    component.onSaveUser({} as any);
    expect(called).toBeTruthy();
  });

  it('should delete user', () => {
    let calledWith = null;
    mockUserService.deleteUser = (id: any) => {
      calledWith = id;
      return of(true);
    };
    component.onDeleteUser(1);
    expect(calledWith).toBe(1);
  });

});

