import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailsPageComponent } from './user-details-page.component';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { of, throwError } from 'rxjs';
import { User } from '../../core/models/user.model';
import { beforeEach, describe, expect, it } from 'vitest';

describe('UserDetailsPageComponent', () => {
  let component: UserDetailsPageComponent;
  let fixture: ComponentFixture<UserDetailsPageComponent>;

  const mockUser: User = {
    id: 1,
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    role: 'Admin',
    isActive: true,
    avatarUrl: ''
  };

  function setup(getUserByIdReturn: any) {
    const mockUserService = {
      getUserById: () => getUserByIdReturn
    };

    TestBed.configureTestingModule({
      imports: [UserDetailsPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => '1' }) }
        },
        {
          provide: UserService,
          useValue: mockUserService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup(of(mockUser));
    expect(component).toBeTruthy();
  });

  it('should fetch user by id from the API', () => {
    setup(of(mockUser));
    component.user$.subscribe(user => {
      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(user?.firstName).toBe('Ada');
    });
  });

  it('should set errorMessage when API call fails', () => {
    setup(throwError(() => new Error('Not found')));
    component.user$.subscribe(() => {
      expect(component.errorMessage).toBe('Not found');
    });
  });
});
