import { BcryptPasswordHasherService } from './bcrypt-password-hasher.service';

describe('BcryptPasswordHasherService', () => {
  let service: BcryptPasswordHasherService;

  beforeEach(() => {
    service = new BcryptPasswordHasherService();
  });

  describe('hash', () => {
    it('should hash a plain password', async () => {
      const password = 'Password123!';

      const hashed = await service.hash(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'Password123!';

      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()';

      const hashed = await service.hash(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
    });
  });

  describe('verify', () => {
    it('should return true for correct password', async () => {
      const password = 'Password123!';
      const hashed = await service.hash(password);

      const result = await service.verify(password, hashed);

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'Password123!';
      const wrongPassword = 'WrongPassword123!';
      const hashed = await service.hash(password);

      const result = await service.verify(wrongPassword, hashed);

      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'Password123!';
      const hashed = await service.hash(password);

      const result = await service.verify('', hashed);

      expect(result).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'Password123!';
      const hashed = await service.hash(password);

      const result = await service.verify('password123!', hashed);

      expect(result).toBe(false);
    });
  });

  describe('performance', () => {
    it('should hash password in reasonable time', async () => {
      const password = 'Password123!';
      const startTime = Date.now();

      await service.hash(password);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000);
    });
  });
});
