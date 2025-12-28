import { randomUUID } from 'crypto';
import { EntityId } from './entity-id.vo';

/**
 * User identifier value object.
 * Uses UUID v4 by default but can accept any string format.
 *
 * This provides flexibility:
 * - Consumers can use UUIDs (default)
 * - Or sequential IDs from database
 * - Or custom format (email-based, etc.)
 */
export class UserId extends EntityId<string> {
  private constructor(value: string) {
    super(value);
  }

  static generate(): UserId {
    return new UserId(randomUUID());
  }

  static create(value: string): UserId {
    return new UserId(value);
  }

  protected validate(value: string): void {
    super.validate(value);

    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('UserId must be a non-empty string');
    }
  }
}
