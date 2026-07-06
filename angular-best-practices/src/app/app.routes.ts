import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  {
    path: 'users',
    loadComponent: () => import('./features/users/users-page.component').then(m => m.UsersPageComponent)
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./features/users/user-details-page.component').then(m => m.UserDetailsPageComponent)
  }
];
