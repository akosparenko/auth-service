# Architecture Decision Records

## ADR-001: Entity ID as Value Object

**Date:** 2025-12-13  
**Status:** Accepted

### Context

Need flexible entity identification that:
- Allows external systems to provide their own ID format
- Maintains type safety
- Prevents primitive obsession
- Supports different ID strategies (UUID, numeric, composite)

### Decision

Use Value Object pattern for all entity identifiers:

```typescript
// Base
export abstract class EntityId<T> { ... }

// Specific
export class UserId extends EntityId<string> {
  static generate(): UserId  // For new entities
  static create(value: string): UserId  // From external source
}

// Usage
export class User extends Entity<UserId> { ... }
```

### Consequences

**Positive:**
- ✅ Type safety: Cannot mix different entity IDs
- ✅ Flexibility: Accept any ID format via `.create()`
- ✅ Encapsulation: Validation logic in value object
- ✅ Testability: Easy to mock and test
- ✅ Immutability: IDs cannot be changed

**Negative:**
- Slightly more verbose than primitives
- Need to extract `.value` at infrastructure boundaries

### Alternatives Considered

1. **Primitive string/number**: Rejected - no type safety, primitive obsession
2. **Generic Entity<T>**: Rejected - allows mixing IDs, no domain meaning
3. **Branded types**: Rejected - runtime overhead, TypeScript-only safety

### Implementation

See `/docs/entity-id-architecture.md` for complete guide.
