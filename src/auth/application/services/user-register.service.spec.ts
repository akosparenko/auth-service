import { User } from '@/auth/domain/entities/user.entity';
import { PasswordHasherService } from '@/auth/domain/services/password-hasher.service';
import { Email } from '@/auth/domain/value-objects/email.vo';
import RegisterUserDto from '@/auth/infrastructure/controllers/dto/user-registration.dto';
import { UserRepository } from '@/auth/infrastructure/repositories/user.repository';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import UserRegisterService from './user-register.service';

describe('UserRegisterService', () => {
  let service: UserRegisterService;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasherService>;

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    const mockPasswordHasher = {
      hash: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRegisterService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: PasswordHasherService, useValue: mockPasswordHasher },
      ],
    }).compile();

    service = module.get<UserRegisterService>(UserRegisterService);
    userRepository = module.get(UserRepository);
    passwordHasher = module.get(PasswordHasherService);
  });

  describe('register', () => {
    const registerDtoData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test User',
      lastName: 'Example',
    };

    it('should register a new user successfully', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue('hashedPassword');

      const dto = new RegisterUserDto(
        registerDtoData.email,
        registerDtoData.firstName,
        registerDtoData.lastName,
        registerDtoData.password,
      );
      const result = await service.register(dto);

      expect(userRepository.findByEmail).toHaveBeenCalled();
      expect(passwordHasher.hash).toHaveBeenCalledWith(
        registerDtoData.password,
      );
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.email.get()).toBe(registerDtoData.email);
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = User.reconstitute(
        '1',
        registerDtoData.firstName,
        registerDtoData.lastName,
        new Email(registerDtoData.email),
        'hashedPassword',
      );
      userRepository.findByEmail.mockResolvedValue(existingUser);

      const dto = new RegisterUserDto(
        registerDtoData.email,
        registerDtoData.firstName,
        registerDtoData.lastName,
        registerDtoData.password,
      );

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(passwordHasher.hash).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
