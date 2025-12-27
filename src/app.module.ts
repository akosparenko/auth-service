import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PasswordHasherService } from './auth/domain/services/password-hasher.service';
import { BcryptPasswordHasherService } from './auth/infrastructure/services/bcrypt-password-hasher.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: PasswordHasherService,
      useClass: BcryptPasswordHasherService,
    },
  ],
})
export class AppModule {}
