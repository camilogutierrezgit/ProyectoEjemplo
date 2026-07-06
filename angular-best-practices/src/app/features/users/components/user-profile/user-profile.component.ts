import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/models/user.model';
import { UserFieldComponent } from '../user-field/user-field.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, UserFieldComponent, RouterLink],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  @Input({ required: true }) user!: User;

  get fullName(): string {
    return `${this.user.firstName} ${this.user.lastName}`;
  }
}
