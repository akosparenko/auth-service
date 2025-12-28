import { User } from '@/auth/domain/entities/user.entity';
import { UserResponseDto } from '../../infrastructure/controllers/dto/user-response.dto';

export class UserMapper {
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.getId().value,
      email: user.email.get(),
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
