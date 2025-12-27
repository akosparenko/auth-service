export class EntityIdNotSetException extends Error {
  constructor() {
    super('Entity ID is not set');
    this.name = 'EntityIdNotSetException';
  }
}
