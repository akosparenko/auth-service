import { User } from '@/auth/domain/entities/user.entity';
import { UserRepositoryInterface } from '@/auth/domain/repositories/user-repository.interface';

export class UserRepository implements UserRepositoryInterface {
  getNextId(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  findByEmail(): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  save(): Promise<User> {
    throw new Error('Method not implemented.');
  }
}
