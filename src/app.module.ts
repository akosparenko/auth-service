import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { UserRegisterPort } from './auth/application/ports/user-register.port';
import UserRegisterService from './auth/application/services/user-register.service';
import { UserRepositoryInterface } from './auth/domain/repositories/user-repository.interface';
import { PasswordHasherService } from './auth/domain/services/password-hasher.service';
import { UserRegistrationController } from './auth/infrastructure/controllers/user-registration.controller';
import { DomainExceptionFilter } from './auth/infrastructure/filters/domain-exception.filter';
import { PrismaService } from './auth/infrastructure/persistence/prisma/prisma.service';
import { UserRepository } from './auth/infrastructure/repositories/user.repository';
import { BcryptPasswordHasherService } from './auth/infrastructure/services/bcrypt-password-hasher.service';

@Module({
  imports: [],
  controllers: [UserRegistrationController],
  providers: [
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    {
      provide: PasswordHasherService,
      useClass: BcryptPasswordHasherService,
    },
    {
      provide: UserRegisterPort,
      useClass: UserRegisterService,
    },
    {
      provide: UserRepositoryInterface,
      useClass: UserRepository,
    },
  ],
})
export class AppModule {}
