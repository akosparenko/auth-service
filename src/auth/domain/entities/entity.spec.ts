import { Entity } from './entity';
import { EntityId } from '@auth/domain/value-objects/entity-id.vo';

class TestEntityId extends EntityId<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): TestEntityId {
    return new TestEntityId(value);
  }
}

class TestEntity extends Entity<TestEntityId> {
  private constructor(id: TestEntityId) {
    super();
    this.id = id;
  }

  static create(id: string): TestEntity {
    return new TestEntity(TestEntityId.create(id));
  }

  static createWithoutId(): TestEntity {
    const entity = new TestEntity(TestEntityId.create('temp'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (entity as any).id = undefined;
    return entity;
  }
}

describe('Entity (Base Class)', () => {
  describe('getId', () => {
    it('should return the entity ID when set', () => {
      const entity = TestEntity.create('test-id-123');

      const id = entity.getId();

      expect(id.value).toBe('test-id-123');
    });

    it('should throw EntityIdNotSetException when ID is not set', () => {
      const entity = TestEntity.createWithoutId();

      expect(() => entity.getId()).toThrow('Entity ID is not set');
    });
  });

  describe('equals', () => {
    it('should return true when entities have same ID and type', () => {
      const entity1 = TestEntity.create('same-id');
      const entity2 = TestEntity.create('same-id');

      expect(entity1.equals(entity2)).toBe(true);
    });

    it('should return false when entities have different IDs', () => {
      const entity1 = TestEntity.create('id-1');
      const entity2 = TestEntity.create('id-2');

      expect(entity1.equals(entity2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const entity = TestEntity.create('test-id');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(entity.equals(null as any)).toBe(false);
    });

    it('should return false when current entity has no ID', () => {
      const entity1 = TestEntity.createWithoutId();
      const entity2 = TestEntity.create('test-id');

      expect(entity1.equals(entity2)).toBe(false);
    });

    it('should return false when entities are of different types', () => {
      class AnotherTestEntity extends Entity<TestEntityId> {
        private constructor(id: TestEntityId) {
          super();
          this.id = id;
        }
        static create(id: string): AnotherTestEntity {
          return new AnotherTestEntity(TestEntityId.create(id));
        }
      }

      const entity1 = TestEntity.create('same-id');
      const entity2 = AnotherTestEntity.create('same-id');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(entity1.equals(entity2 as any)).toBe(false);
    });
  });

  describe('isNew', () => {
    it('should return false when entity has ID', () => {
      const entity = TestEntity.create('test-id');

      expect(entity.isNew()).toBe(false);
    });

    it('should return true when entity has no ID', () => {
      const entity = TestEntity.createWithoutId();

      expect(entity.isNew()).toBe(true);
    });
  });
});
