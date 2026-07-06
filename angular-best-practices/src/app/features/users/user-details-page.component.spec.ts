import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailsPageComponent } from './user-details-page.component';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { of, BehaviorSubject } from 'rxjs';
import { User } from '../../core/models/user.model';
import { beforeEach, describe, expect, it } from 'vitest';

describe('UserDetailsPageComponent', () => {
  let component: UserDetailsPageComponent;
  let fixture: ComponentFixture<UserDetailsPageComponent>;
  let mockUserService: any;

  beforeEach(async () => {
    const mockUsers = new BehaviorSubject<User[]>([
      { id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', role: 'Admin', isActive: true, avatarUrl: '' }
    ]);
    
    mockUserService = {
      users$: mockUsers.asObservable()
    };

    await TestBed.configureTestingModule({
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user from id param', (done) => {
    component.user$.subscribe(user => {
      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
    });
  });
});
