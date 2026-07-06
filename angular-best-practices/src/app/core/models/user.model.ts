export type UserRole = 'Admin' | 'User' | 'Guest';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl: string;
}

export type CreateUserDto = Omit<User, 'id'>;
export type UpdateUserDto = Partial<User>;
