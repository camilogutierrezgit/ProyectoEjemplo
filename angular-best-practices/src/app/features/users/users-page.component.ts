import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { User, CreateUserDto } from '../../core/models/user.model';
import { UserCardComponent } from './components/user-card/user-card.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { Observable, Subject, takeUntil, finalize } from 'rxjs';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, UserCardComponent, UserFormComponent],
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.css']
})
export class UsersPageComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly destroy$ = new Subject<void>();

  isLoading = true;
  errorMessage = '';

  users$!: Observable<User[]>;

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getUsers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => console.log('Users loaded'),
        error: (err) => this.errorMessage = err.message
      });
  }

  onSaveUser(userDto: CreateUserDto): void {
    this.userService.addUser(userDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onDeleteUser(id: number): void {
    this.userService.deleteUser(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
