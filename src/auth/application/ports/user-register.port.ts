import { User } from '@/auth/domain/entities/user.entity';
import RegisterUserDto from '@/auth/infrastructure/controllers/dto/user-registration.dto';

export abstract class UserRegisterPort {
  abstract register(registerUserDto: RegisterUserDto): Promise<User>;
}
