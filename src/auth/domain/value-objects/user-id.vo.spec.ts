import { UserId } from './user-id.vo';

describe('UserId Value Object', () => {
  describe('generate', () => {
    it('should generate unique UUIDs on each call', () => {
      const userId1 = UserId.generate();
      const userId2 = UserId.generate();

      expect(userId1.value).not.toBe(userId2.value);
      expect(userId1.equals(userId2)).toBe(false);
    });

    it('should generate UUID v4 format', () => {
      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      const userId = UserId.generate();

      expect(userId.value).toMatch(uuidV4Regex);
    });
  });

  describe('create', () => {
    it('should create UserId from valid string', () => {
      const userId = UserId.create('user-123');

      expect(userId.value).toBe('user-123');
    });

    it('should accept UUID string', () => {
      const uuidValue = '550e8400-e29b-41d4-a716-446655440000';

      const userId = UserId.create(uuidValue);

      expect(userId.value).toBe(uuidValue);
    });

    it('should accept numeric string (database ID)', () => {
      const userId = UserId.create('12345');

      expect(userId.value).toBe('12345');
    });

    it('should accept composite string format', () => {
      const userId = UserId.create('tenant-123:user-456');

      expect(userId.value).toBe('tenant-123:user-456');
    });

    it('should throw error for empty string', () => {
      expect(() => UserId.create('')).toThrow(
        'UserId must be a non-empty string',
      );
    });

    it('should throw error for whitespace-only string', () => {
      expect(() => UserId.create('   ')).toThrow(
        'UserId must be a non-empty string',
      );
    });

    it('should throw error for null', () => {
      expect(() => UserId.create(null as any)).toThrow(
        'ID cannot be null or undefined',
      );
    });

    it('should throw error for non-string value', () => {
      expect(() => UserId.create(123 as any)).toThrow(
        'UserId must be a non-empty string',
      );
    });
  });

  describe('equals', () => {
    it('should return true for UserIds with same value', () => {
      const userId1 = UserId.create('same-id');
      const userId2 = UserId.create('same-id');

      expect(userId1.equals(userId2)).toBe(true);
    });

    it('should return false for UserIds with different values', () => {
      const userId1 = UserId.create('id-1');
      const userId2 = UserId.create('id-2');

      expect(userId1.equals(userId2)).toBe(false);
    });
  });
});
