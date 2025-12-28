import { UserMapper } from '@/auth/application/mappers/user.mapper';
import { UserRegisterPort } from '@/auth/application/ports/user-register.port';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import RegisterUserDto from './dto/user-registration.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller()
export class UserRegistrationController {
  constructor(private readonly userRegistrationService: UserRegisterPort) {}

  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(
    @Body() userRegistrationDto: RegisterUserDto,
  ): Promise<UserResponseDto> {
    const user =
      await this.userRegistrationService.register(userRegistrationDto);
    return UserMapper.toResponseDto(user);
  }
}
