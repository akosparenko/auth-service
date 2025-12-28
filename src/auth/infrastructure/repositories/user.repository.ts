import { User } from '@/auth/domain/entities/user.entity';
import { UserRepositoryInterface } from '@/auth/domain/repositories/user-repository.interface';
import { Email } from '@/auth/domain/value-objects/email.vo';
import { Injectable } from '@nestjs/common';
import { PrismaUserMapper } from '../persistence/prisma/mappers/prisma-user.mapper';
import { PrismaService } from '../persistence/prisma/prisma.service';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.get() },
    });

    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async save(user: User): Promise<User> {
    const data = PrismaUserMapper.toPersistence(user);

    const savedUser = await this.prisma.user.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });

    return PrismaUserMapper.toDomain(savedUser);
  }
}
