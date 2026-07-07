export interface RoleDto {
  uuid?: string;
  name: string;
}

export interface UserDto {
  uuid?: string;
  username: string;
  email: string;
  password?: string;
  role?: RoleDto;
}
