import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-field.component.html',
  styleUrls: ['./user-field.component.css']
})
export class UserFieldComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
}
