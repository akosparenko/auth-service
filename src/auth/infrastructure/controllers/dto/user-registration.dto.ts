export default class RegisterUserDto {
  public constructor(
    public readonly email: string,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly password: string,
  ) {}
}
