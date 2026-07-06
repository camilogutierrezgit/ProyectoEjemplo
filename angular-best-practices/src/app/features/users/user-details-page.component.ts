import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { map, switchMap, Observable } from 'rxjs';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-details-page',
  standalone: true,
  imports: [CommonModule, UserProfileComponent],
  templateUrl: './user-details-page.component.html',
  styleUrls: ['./users-page.component.css']
})
export class UserDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  user$!: Observable<User | undefined>;

  ngOnInit() {
    this.user$ = this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      switchMap(id => this.userService.users$.pipe(
        map(users => users.find(u => u.id === id))
      ))
    );
  }
}
