import type { UserRegisterPort } from '@/auth/application/ports/user-register.port';
import { Body, Controller, Post } from '@nestjs/common';
import RegisterUserDto from './dto/user-registration.dto';

@Controller()
export class UserRegistrationController {
  constructor(private readonly userRegistrationService: UserRegisterPort) {}

  @Post('users')
  registerUser(@Body() userRegistrationDto: RegisterUserDto) {
    return this.userRegistrationService.register(userRegistrationDto);
  }
}
