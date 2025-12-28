export class UserResponseDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
