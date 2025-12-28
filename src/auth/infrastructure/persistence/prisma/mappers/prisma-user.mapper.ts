import { UserStatus } from '@/auth/domain/entities/user-status.enum';
import { User } from '@/auth/domain/entities/user.entity';
import { Email } from '@/auth/domain/value-objects/email.vo';
import type { User as PrismaUser } from '@prisma/client';

export class PrismaUserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return User.reconstitute(
      prismaUser.id,
      prismaUser.firstName,
      prismaUser.lastName,
      new Email(prismaUser.email),
      prismaUser.password,
      prismaUser.status as UserStatus,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }

  static toPersistence(user: User): {
    id: string;
    email: string;
    password: string;
    firstName: string | null;
    lastName: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: user.getId().value,
      email: user.email.get(),
      password: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
