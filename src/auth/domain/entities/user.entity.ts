import { UserId } from '@/auth/domain/value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { Entity } from './entity';

export class User extends Entity<UserId> {
  public firstName: string | null;
  public lastName: string | null;
  public email: Email;
  public passwordHash: string;

  private constructor(
    id: UserId,
    firstName: string | null,
    lastName: string | null,
    email: Email,
    passwordHash: string,
  ) {
    super();
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  static create(
    firstName: string | null,
    lastName: string | null,
    email: Email,
    passwordHash: string,
  ): User {
    const id = UserId.generate();
    return new User(id, firstName, lastName, email, passwordHash);
  }

  static reconstitute(
    id: string,
    firstName: string | null,
    lastName: string | null,
    email: Email,
    passwordHash: string,
  ): User {
    const userId = UserId.create(id);
    return new User(userId, firstName, lastName, email, passwordHash);
  }
}
