import { UserId } from '@auth/domain/value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { User } from './user.entity';

describe('User Entity', () => {
  const validUserData = {
    firstName: 'John',
    lastName: 'Doe',
    email: new Email('john.doe@example.com'),
    passwordHash: 'hashed_password_123',
  };

  const minimalUserData = {
    firstName: null,
    lastName: null,
    email: new Email('minimal@example.com'),
    passwordHash: 'hashed_password_456',
  };

  describe('create (factory method)', () => {
    it('should create user with generated UUID', () => {
      const user = User.create(
        validUserData.firstName,
        validUserData.lastName,
        validUserData.email,
        validUserData.passwordHash,
      );

      expect(user).toBeInstanceOf(User);
      expect(user.getId()).toBeInstanceOf(UserId);
    });

    it('should assign user properties correctly', () => {
      const user = User.create(
        'Jane',
        'Smith',
        new Email('jane@example.com'),
        'hashed_pass',
      );

      expect(user.firstName).toBe('Jane');
      expect(user.lastName).toBe('Smith');
      expect(user.email.get()).toBe('jane@example.com');
      expect(user.passwordHash).toBe('hashed_pass');
    });

    it('should generate unique IDs for different users', () => {
      const user1 = User.create(
        'User',
        'One',
        new Email('user1@test.com'),
        'hash1',
      );
      const user2 = User.create(
        'User',
        'Two',
        new Email('user2@test.com'),
        'hash2',
      );

      expect(user1.getId().value).not.toBe(user2.getId().value);
      expect(user1.equals(user2)).toBe(false);
    });

    it('should create user with UUID v4 format ID', () => {
      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      const user = User.create(
        validUserData.firstName,
        validUserData.lastName,
        validUserData.email,
        validUserData.passwordHash,
      );

      expect(user.getId().value).toMatch(uuidV4Regex);
    });

    it('should create user with null firstName', () => {
      const user = User.create(
        null,
        'Doe',
        new Email('user@example.com'),
        'hash',
      );

      expect(user.firstName).toBeNull();
      expect(user.lastName).toBe('Doe');
    });

    it('should create user with null lastName', () => {
      const user = User.create(
        'John',
        null,
        new Email('user@example.com'),
        'hash',
      );

      expect(user.firstName).toBe('John');
      expect(user.lastName).toBeNull();
    });

    it('should create user with both names null', () => {
      const user = User.create(
        minimalUserData.firstName,
        minimalUserData.lastName,
        minimalUserData.email,
        minimalUserData.passwordHash,
      );

      expect(user.firstName).toBeNull();
      expect(user.lastName).toBeNull();
      expect(user.email).toBe(minimalUserData.email);
    });
  });

  describe('reconstitute (factory method)', () => {
    it('should reconstitute user with provided ID and properties', () => {
      const user = User.reconstitute(
        'user-123',
        'Alice',
        'Wonder',
        new Email('alice@example.com'),
        'secure_hash',
      );

      expect(user.getId().value).toBe('user-123');
      expect(user.firstName).toBe('Alice');
      expect(user.lastName).toBe('Wonder');
      expect(user.email.get()).toBe('alice@example.com');
      expect(user.passwordHash).toBe('secure_hash');
    });

    it('should accept numeric string ID (from database)', () => {
      const user = User.reconstitute(
        '12345',
        validUserData.firstName,
        validUserData.lastName,
        validUserData.email,
        validUserData.passwordHash,
      );

      expect(user.getId().value).toBe('12345');
    });

    it('should throw error when reconstituting with empty string ID', () => {
      expect(() =>
        User.reconstitute(
          '',
          'First',
          'Last',
          new Email('email@test.com'),
          'hash',
        ),
      ).toThrow('UserId must be a non-empty string');
    });

    it('should reconstitute user with null firstName', () => {
      const user = User.reconstitute(
        'user-id',
        null,
        'Smith',
        new Email('test@example.com'),
        'hash',
      );

      expect(user.firstName).toBeNull();
      expect(user.lastName).toBe('Smith');
    });

    it('should reconstitute user with null lastName', () => {
      const user = User.reconstitute(
        'user-id',
        'Alice',
        null,
        new Email('test@example.com'),
        'hash',
      );

      expect(user.firstName).toBe('Alice');
      expect(user.lastName).toBeNull();
    });

    it('should reconstitute user with both names null', () => {
      const user = User.reconstitute(
        'user-id',
        null,
        null,
        new Email('minimal@example.com'),
        'hash',
      );

      expect(user.firstName).toBeNull();
      expect(user.lastName).toBeNull();
      expect(user.email.get()).toBe('minimal@example.com');
    });
  });

  describe('equals', () => {
    it('should return true when users have same ID', () => {
      const userId = 'same-user-id';
      const user1 = User.reconstitute(
        userId,
        'John',
        'Doe',
        new Email('john@example.com'),
        'hash1',
      );
      const user2 = User.reconstitute(
        userId,
        'Jane',
        'Smith',
        new Email('jane@example.com'),
        'hash2',
      );

      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false when users have different IDs', () => {
      const user1 = User.reconstitute(
        'user-1',
        'John',
        'Doe',
        new Email('john@test.com'),
        'hash',
      );
      const user2 = User.reconstitute(
        'user-2',
        'Jane',
        'Doe',
        new Email('jane@test.com'),
        'hash',
      );

      expect(user1.equals(user2)).toBe(false);
    });
  });

  describe('use cases', () => {
    it('should support repository save and load pattern', () => {
      const newUser = User.create(
        'New',
        'User',
        new Email('new@example.com'),
        'hash',
      );
      const savedId = newUser.getId().value;

      const loadedUser = User.reconstitute(
        savedId,
        newUser.firstName,
        newUser.lastName,
        newUser.email,
        newUser.passwordHash,
      );

      expect(loadedUser.getId().value).toBe(savedId);
      expect(newUser.equals(loadedUser)).toBe(true);
    });

    it('should support external system numeric ID format', () => {
      const user = User.reconstitute(
        '999999',
        validUserData.firstName,
        validUserData.lastName,
        validUserData.email,
        validUserData.passwordHash,
      );

      expect(user.getId().value).toBe('999999');
      expect(user).toBeInstanceOf(User);
    });

    it('should handle users with and without names equally', () => {
      const userWithNames = User.create(
        'John',
        'Doe',
        new Email('full@example.com'),
        'hash',
      );
      const userWithoutNames = User.create(
        null,
        null,
        new Email('minimal@example.com'),
        'hash',
      );

      expect(userWithNames).toBeInstanceOf(User);
      expect(userWithoutNames).toBeInstanceOf(User);
      expect(userWithNames.getId()).toBeInstanceOf(UserId);
      expect(userWithoutNames.getId()).toBeInstanceOf(UserId);
    });
  });
});
