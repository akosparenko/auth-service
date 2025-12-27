export abstract class PasswordHasherService {
  abstract hash(password: string): Promise<string>;
  abstract verify(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
