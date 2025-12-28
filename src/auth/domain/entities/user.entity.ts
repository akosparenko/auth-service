import { UserId } from '@/auth/domain/value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { Entity } from './entity';
import { UserStatus } from './user-status.enum';

export class User extends Entity<UserId> {
  public firstName: string | null;
  public lastName: string | null;
  public email: Email;
  public passwordHash: string;
  public status: UserStatus;
  public createdAt: Date;
  public updatedAt: Date;

  private constructor(
    id: UserId,
    firstName: string | null,
    lastName: string | null,
    email: Email,
    passwordHash: string,
    status: UserStatus,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.passwordHash = passwordHash;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    firstName: string | null,
    lastName: string | null,
    email: Email,
    passwordHash: string,
  ): User {
    const id = UserId.generate();
    const now = new Date();
    return new User(
      id,
      firstName,
      lastName,
      email,
      passwordHash,
      UserStatus.ACTIVE,
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    firstName: string | null,
    lastName: string | null,
    email: Email,
    passwordHash: string,
    status: UserStatus,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    const userId = UserId.create(id);
    return new User(
      userId,
      firstName,
      lastName,
      email,
      passwordHash,
      status,
      createdAt,
      updatedAt,
    );
  }
}
