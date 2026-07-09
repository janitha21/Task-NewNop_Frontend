import { UserDto } from './user.model';

export interface LoginRequest {
  username: string;
  password?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}
