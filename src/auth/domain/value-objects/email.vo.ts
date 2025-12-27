export class Email {
  private readonly email: string;

  public constructor(email: string) {
    this.validate(email);
    this.email = email;
  }

  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  public get(): string {
    return this.email;
  }
}
