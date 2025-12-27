import { Email } from './email.vo';

describe('Email', () => {
  describe('constructor', () => {
    it('should create email with valid format', () => {
      const email = new Email('user@example.com');
      expect(email.get()).toBe('user@example.com');
    });

    it('should throw error when email is missing @', () => {
      expect(() => new Email('userexample.com')).toThrow(
        'Invalid email format',
      );
    });

    it('should throw error when email is missing domain', () => {
      expect(() => new Email('user@')).toThrow('Invalid email format');
    });

    it('should throw error when email contains spaces', () => {
      expect(() => new Email('user @example.com')).toThrow(
        'Invalid email format',
      );
    });

    it('should throw error when email is empty', () => {
      expect(() => new Email('')).toThrow('Invalid email format');
    });
  });

  describe('get', () => {
    it('should return the email value', () => {
      const emailValue = 'test@domain.com';
      const email = new Email(emailValue);
      expect(email.get()).toBe(emailValue);
    });
  });
});
