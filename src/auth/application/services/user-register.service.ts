import { User } from '@/auth/domain/entities/user.entity';
import { PasswordHasherService } from '@/auth/domain/services/password-hasher.service';
import { Email } from '@/auth/domain/value-objects/email.vo';
import { UserRepositoryInterface } from '@/auth/domain/repositories/user-repository.interface';
import RegisterUserDto from '@/auth/infrastructure/controllers/dto/user-registration.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { UserRegisterPort } from '../ports/user-register.port';

@Injectable()
export default class UserRegisterService implements UserRegisterPort {
  public constructor(
    private readonly repository: UserRepositoryInterface,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const email = new Email(registerUserDto.email);

    const existingUser = await this.repository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.passwordHasher.hash(
      registerUserDto.password,
    );

    const user = User.create(
      registerUserDto.firstName,
      registerUserDto.lastName,
      email,
      hashedPassword,
    );

    await this.repository.save(user);

    return user;
  }
}
