import { EntityId } from './entity-id.vo';

class TestId extends EntityId<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): TestId {
    return new TestId(value);
  }
}

class NumericTestId extends EntityId<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): NumericTestId {
    return new NumericTestId(value);
  }
}

describe('EntityId (Base Value Object)', () => {
  describe('creation', () => {
    it('should create an ID with valid value', () => {
      const id = TestId.create('test-123');

      expect(id.value).toBe('test-123');
    });

    it('should create an ID with numeric value', () => {
      const id = NumericTestId.create(123);

      expect(id.value).toBe(123);
    });

    it('should throw error when value is null', () => {
      expect(() => TestId.create(null as any)).toThrow(
        'ID cannot be null or undefined',
      );
    });

    it('should throw error when value is undefined', () => {
      expect(() => TestId.create(undefined as any)).toThrow(
        'ID cannot be null or undefined',
      );
    });
  });

  describe('equals', () => {
    it('should return true when IDs have the same value', () => {
      const id1 = TestId.create('same-value');
      const id2 = TestId.create('same-value');

      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false when IDs have different values', () => {
      const id1 = TestId.create('value-1');
      const id2 = TestId.create('value-2');

      expect(id1.equals(id2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const id = TestId.create('value');

      expect(id.equals(null as any)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should convert value to string', () => {
      const id = TestId.create('test-value');

      expect(id.toString()).toBe('test-value');
    });

    it('should convert number value to string', () => {
      class NumericId extends EntityId<number> {
        private constructor(value: number) {
          super(value);
        }
        static create(value: number): NumericId {
          return new NumericId(value);
        }
      }
      const id = NumericId.create(123);

      expect(id.toString()).toBe('123');
    });
  });
});
