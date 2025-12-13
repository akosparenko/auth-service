/**
 * Base class for all entity identifiers.
 * Ensures type safety and prevents mixing different entity IDs.
 * 
 * @example
 * class UserId extends EntityId<string> {}
 * class OrderId extends EntityId<number> {}
 */
export abstract class EntityId<T = string> {
  protected readonly _value: T;

  protected constructor(value: T) {
    this.validate(value);
    this._value = value;
  }

  get value(): T {
    return this._value;
  }

  protected validate(value: T): void {
    if (value === null || value === undefined) {
      throw new Error('ID cannot be null or undefined');
    }
  }

  equals(other: EntityId<T>): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  toString(): string {
    return String(this._value);
  }
}
