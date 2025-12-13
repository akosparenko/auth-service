# Entity ID Architecture Guide

## Overview

This auth-service uses **Value Objects for Entity IDs** to provide maximum flexibility while maintaining type safety and domain integrity.

## Architecture Benefits

### ✅ **Flexibility for External Systems**
- Default UUID generation (industry standard)
- Accept any ID format from external systems (numeric, composite, etc.)
- No coupling to specific ID implementation

### ✅ **Type Safety**
```typescript
const userId = UserId.create('123');
const sessionId = SessionId.create('123');

// TypeScript compiler prevents this:
user.setId(sessionId); // ❌ Compile error - type mismatch
```

### ✅ **Domain Logic Encapsulation**
- Validation logic lives in the ID value object
- Cannot create invalid IDs
- Prevents primitive obsession

### ✅ **Immutability**
- IDs cannot be changed after creation
- Prevents accidental mutations

## Usage Examples

### Creating New Entities (UUID)

```typescript
import { User } from '@auth/domain/entities/user.entity.js';

// Generate new user with UUID
const user = User.create({
  email: 'user@example.com',
  password: 'hashed_password'
});

console.log(user.getId().value); // "550e8400-e29b-41d4-a716-446655440000"
```

### Reconstituting from Database (Any ID Format)

```typescript
// Scenario 1: Database uses auto-increment integers
const userFromDb = User.reconstitute('12345', {
  email: 'user@example.com',
  // ... other properties
});

// Scenario 2: Database uses UUIDs
const userFromDb = User.reconstitute('550e8400-e29b-41d4-a716-446655440000', {
  email: 'user@example.com',
});

// Scenario 3: Custom format (e.g., composite key)
const userFromDb = User.reconstitute('tenant-123:user-456', {
  email: 'user@example.com',
});
```

### Repository Pattern

```typescript
// domain/repositories/user.repository.ts (Interface)
export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}

// infrastructure/persistence/typeorm/repositories/typeorm-user.repository.ts
@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  async findById(id: UserId): Promise<User | null> {
    const entity = await this.ormRepo.findOne({
      where: { id: id.value } // Extract primitive value for query
    });
    
    if (!entity) return null;
    
    // Reconstitute domain entity with database ID
    return User.reconstitute(entity.id, {
      email: entity.email,
      // ... other properties
    });
  }

  async save(user: User): Promise<void> {
    const ormEntity = {
      id: user.getId().value, // Extract primitive value
      email: user.email,
      // ... other properties
    };
    
    await this.ormRepo.save(ormEntity);
  }
}
```

## Creating New Entity ID Types

For each aggregate root, create a dedicated ID value object:

```typescript
// domain/value-objects/session-id.vo.ts
import { randomUUID } from 'crypto';
import { EntityId } from './entity-id.vo.js';

export class SessionId extends EntityId<string> {
  private constructor(value: string) {
    super(value);
  }

  static generate(): SessionId {
    return new SessionId(randomUUID());
  }

  static create(value: string): SessionId {
    return new SessionId(value);
  }

  protected validate(value: string): void {
    super.validate(value);
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('SessionId must be a non-empty string');
    }
  }
}
```

## Supporting Different ID Formats

### Numeric IDs

```typescript
// domain/value-objects/legacy-user-id.vo.ts
import { EntityId } from './entity-id.vo.js';

export class LegacyUserId extends EntityId<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): LegacyUserId {
    return new LegacyUserId(value);
  }

  protected validate(value: number): void {
    super.validate(value);
    if (typeof value !== 'number' || value <= 0) {
      throw new Error('LegacyUserId must be a positive number');
    }
  }
}
```

### Composite IDs

```typescript
// domain/value-objects/tenant-user-id.vo.ts
import { EntityId } from './entity-id.vo.js';

interface TenantUserIdValue {
  tenantId: string;
  userId: string;
}

export class TenantUserId extends EntityId<TenantUserIdValue> {
  private constructor(value: TenantUserIdValue) {
    super(value);
  }

  static create(tenantId: string, userId: string): TenantUserId {
    return new TenantUserId({ tenantId, userId });
  }

  static fromString(value: string): TenantUserId {
    const [tenantId, userId] = value.split(':');
    return new TenantUserId({ tenantId, userId });
  }

  protected validate(value: TenantUserIdValue): void {
    super.validate(value);
    if (!value.tenantId || !value.userId) {
      throw new Error('TenantUserId requires both tenantId and userId');
    }
  }

  toString(): string {
    return `${this._value.tenantId}:${this._value.userId}`;
  }
}
```

## Migration Strategy

### From Existing Numeric IDs

If you have an existing system with numeric IDs:

1. Keep `UserId` but change internal type:
```typescript
export class UserId extends EntityId<number> {
  static create(value: number): UserId {
    return new UserId(value);
  }
  
  // Later, when migrating, change to string-based
}
```

2. Or create a new ID type and migrate gradually:
```typescript
// Old entities use NumericUserId
// New entities use UserId (UUID)
// Eventually migrate all to UserId
```

## Testing

```typescript
describe('UserId', () => {
  describe('generate', () => {
    it('should generate unique UUIDs', () => {
      const id1 = UserId.generate();
      const id2 = UserId.generate();
      
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('create', () => {
    it('should create from existing value', () => {
      const id = UserId.create('123');
      
      expect(id.value).toBe('123');
    });

    it('should reject empty string', () => {
      expect(() => UserId.create('')).toThrow('UserId must be a non-empty string');
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const id1 = UserId.create('123');
      const id2 = UserId.create('123');
      
      expect(id1.equals(id2)).toBe(true);
    });
  });
});
```

## Best Practices

### ✅ DO
- Use factory methods (`create`, `generate`) instead of `new`
- Validate in the ID constructor
- Make IDs immutable
- One ID type per aggregate root
- Extract primitive value only at infrastructure boundaries

### ❌ DON'T
- Don't use raw primitives (`string`, `number`) as entity IDs in domain layer
- Don't allow ID mutation after creation
- Don't validate IDs outside the value object
- Don't mix different entity ID types

## Summary

This architecture gives you:
- **Flexibility**: Accept any ID format from external systems
- **Type Safety**: Compiler prevents ID mixing
- **Encapsulation**: Validation logic in one place
- **Testability**: Easy to test and mock
- **Maintainability**: Clear domain concepts
- **Migration Path**: Easy to change ID implementation

The external application can provide IDs in any format (UUID, numeric, composite) - just use `UserId.create(externalId)` to wrap it.
