import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { map, switchMap, Observable, catchError, of } from 'rxjs';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-details-page',
  standalone: true,
  imports: [CommonModule, UserProfileComponent, RouterLink],
  templateUrl: './user-details-page.component.html',
  styleUrls: ['./users-page.component.css']
})
export class UserDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  user$!: Observable<User | null>;
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    this.user$ = this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      switchMap(id => this.userService.getUserById(id).pipe(
        catchError(err => {
          this.errorMessage = err.message;
          return of(null);
        })
      ))
    );

    this.user$.subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false
    });
  }
}
