import { EntityIdNotSetException } from '@/auth/domain/exceptions/entity-id-not-set.exception';
import { EntityId } from '@/auth/domain/value-objects/entity-id.vo';

/**
 * Base entity class for all domain aggregates and entities.
 *
 * Uses EntityId value object for type-safe identifiers.
 * Generic TId allows each entity to define its own ID type.
 *
 * @example
 * class User extends Entity<UserId> {}
 * class Session extends Entity<SessionId> {}
 */
export abstract class Entity<TId extends EntityId> {
  protected id?: TId;

  public getId(): TId {
    if (!this.id) {
      throw new EntityIdNotSetException();
    }

    return this.id;
  }

  /** Entities are equal if they have the same ID and are of the same type */
  public equals(other: Entity<TId>): boolean {
    if (!other || !this.id) {
      return false;
    }

    if (this.constructor !== other.constructor) {
      return false;
    }

    return this.id.equals(other.getId());
  }

  /**
   * Check if entity has been persisted (has an ID)
   */
  public isNew(): boolean {
    return !this.id;
  }
}
