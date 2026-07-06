import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUserDto, UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent {
  @Output() save = new EventEmitter<CreateUserDto>();

  userForm: FormGroup;
  roles: UserRole[] = ['Admin', 'User', 'Guest'];

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['User', Validators.required]
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const newUser: CreateUserDto = {
        ...this.userForm.value,
        isActive: true,
        avatarUrl: `https://i.pravatar.cc/150?u=${this.userForm.value.email}`
      };
      this.save.emit(newUser);
      this.userForm.reset({ role: 'User' });
    }
  }
}
