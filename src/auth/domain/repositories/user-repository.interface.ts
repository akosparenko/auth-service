import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';

export abstract class UserRepositoryInterface {
  abstract getNextId(): Promise<number>;
  abstract findByEmail(email: Email): Promise<User | null>;
  abstract save(user: User): Promise<User>;
}
