import { User } from '@/auth/domain/entities/user.entity';
import { UserRepositoryInterface } from '@/auth/domain/repositories/user-repository.interface';
import { Email } from '@/auth/domain/value-objects/email.vo';

export class UserRepository implements UserRepositoryInterface {
  getNextId(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  findByEmail(email: Email): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  save(user: User): Promise<User> {
    throw new Error('Method not implemented.');
  }
}
