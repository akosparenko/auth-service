# User Registration Flow - DDD/Hexagonal Architecture Plan

**Created:** 2025-12-13  
**Status:** Planning  
**Feature:** User Registration

---

## 📋 Overview

This document outlines the architecture and implementation plan for user registration following Domain-Driven Design (DDD), Hexagonal Architecture, and Clean Architecture principles.

---

## ✅ Correct Flow for User Registration

### Layer Responsibilities

```
HTTP Request
    ↓
[Controller] (Infrastructure Layer)
    - Validate HTTP request format
    - Transform to DTO
    - Pass to Use Case
    ↓
[Use Case] (Application Layer)
    - Orchestrate the registration flow
    - Business workflow logic
    - Call domain services/entities
    - Call repository to persist
    ↓
[Domain Entities/Services] (Domain Layer)
    - Business rules & validation
    - Create User aggregate
    - Hash password (domain service)
    ↓
[Repository] (Domain Interface, Infrastructure Implementation)
    - Persist User aggregate
    - Abstract database details
    ↓
Database
```

---

## 🎯 Component Responsibilities

### 1. Infrastructure Layer - Controller

**Purpose:** HTTP adapter, request/response transformation

**Files:**

- `infrastructure/controllers/auth.controller.ts`
- `infrastructure/controllers/dtos/register.request.dto.ts`
- `infrastructure/controllers/dtos/user.response.dto.ts`

**Responsibilities:**

- ✅ Validate HTTP request format (class-validator)
- ✅ Transform to application DTO
- ✅ Call use case
- ✅ Transform result to HTTP response
- ❌ NO business logic
- ❌ NO direct repository access

**Example:**

```typescript
// infrastructure/controllers/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Post('register')
  async register(@Body() dto: RegisterRequestDto): Promise<UserResponseDto> {
    // 1. NestJS validates DTO with class-validator
    // 2. Pass to use case
    const result = await this.registerUserUseCase.execute({
      email: dto.email,
      password: dto.password,
    });

    // 3. Map domain result to HTTP response DTO
    return {
      id: result.id,
      email: result.email,
      createdAt: result.createdAt,
    };
  }
}
```

---

### 2. Application Layer - Use Case

**Purpose:** Orchestrate business workflow

**Files:**

- `application/use-cases/register-user/register-user.use-case.ts`
- `application/use-cases/register-user/register-user.dto.ts`
- `application/use-cases/register-user/register-user.result.ts`

**Responsibilities:**

- ✅ Orchestrate registration flow
- ✅ Create domain objects (call factories)
- ✅ Enforce business rules (user uniqueness)
- ✅ Call repositories to persist
- ✅ Handle domain events (optional)
- ❌ NO HTTP concerns
- ❌ NO database queries (use repository)

**Example:**

```typescript
// application/use-cases/register-user/register-user.use-case.ts
@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async execute(dto: RegisterUserDto): Promise<RegisterUserResult> {
    // 1. Create value objects (domain validation happens here)
    const email = Email.create(dto.email); // throws if invalid
    const password = PlainPassword.create(dto.password); // throws if weak

    // 2. Check business rule: user must not already exist
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException(email);
    }

    // 3. Create User aggregate (domain logic here)
    const user = User.create(email, password, this.passwordHasher);

    // 4. Persist via repository
    await this.userRepository.save(user);

    // 5. Return result (not domain object directly)
    return {
      id: user.getId().value,
      email: user.getEmail().value,
      createdAt: user.getCreatedAt(),
    };
  }
}
```

---

### 3. Domain Layer - Aggregate Root

**Purpose:** Business rules and entity lifecycle

**Files:**

- `domain/aggregates/user/user.aggregate.ts`
- `domain/aggregates/user/events/user-registered.event.ts`
- `domain/value-objects/email.vo.ts`
- `domain/value-objects/plain-password.vo.ts`
- `domain/value-objects/hashed-password.vo.ts`
- `domain/value-objects/user-id.vo.ts`
- `domain/domain-services/password-hasher.service.ts`

**Responsibilities:**

- ✅ Business validation (email format, password strength)
- ✅ Invariant enforcement (can't change email if inactive)
- ✅ Self-creation via factory methods
- ✅ Encapsulate state changes
- ❌ NO persistence logic
- ❌ NO application workflow

**Example:**

```typescript
// domain/aggregates/user/user.aggregate.ts
export class User {
  private constructor(
    private readonly id: UserId,
    private email: Email,
    private password: HashedPassword,
    private status: UserStatus,
    private readonly createdAt: Date,
  ) {}

  static create(
    email: Email,
    password: PlainPassword,
    hasher: PasswordHasher,
  ): User {
    const hashed = hasher.hash(password);
    return new User(
      UserId.generate(),
      email,
      hashed,
      UserStatus.Active,
      new Date(),
    );
  }

  changeEmail(newEmail: Email): void {
    if (this.status !== UserStatus.Active) {
      throw new DomainException('Cannot change email of inactive user');
    }
    this.email = newEmail;
  }

  deactivate(): void {
    this.status = UserStatus.Inactive;
  }

  getId(): UserId {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
```

---

### 4. Domain Layer - Repository Interface

**Purpose:** Abstract persistence

**Files:**

- `domain/repositories/user.repository.ts`

**Responsibilities:**

- ✅ Define contract for persistence
- ✅ Return domain objects
- ✅ Work with aggregate roots only
- ❌ NO implementation details

**Example:**

```typescript
// domain/repositories/user.repository.ts
export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}
```

---

### 5. Infrastructure Layer - Repository Implementation

**Purpose:** Actual database persistence

**Files:**

- `infrastructure/persistence/typeorm/repositories/typeorm-user.repository.ts`
- `infrastructure/persistence/typeorm/entities/user.entity.ts`

**Responsibilities:**

- ✅ Implement repository interface
- ✅ ORM mapping (domain ↔ database)
- ✅ Handle database operations
- ❌ NO business logic

**Example:**

```typescript
// infrastructure/persistence/typeorm/repositories/typeorm-user.repository.ts
@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly ormRepository: Repository<UserEntity>,
  ) {}

  async findById(id: UserId): Promise<User | null> {
    const entity = await this.ormRepository.findOne({
      where: { id: id.value },
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.ormRepository.findOne({
      where: { email: email.value },
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async save(user: User): Promise<void> {
    const entity = UserMapper.toPersistence(user);
    await this.ormRepository.save(entity);
  }

  async delete(id: UserId): Promise<void> {
    await this.ormRepository.delete({ id: id.value });
  }
}
```

---

## 📂 Complete File Structure

```
src/auth/
├── domain/
│   ├── aggregates/
│   │   └── user/
│   │       ├── user.aggregate.ts              # User aggregate root
│   │       ├── user.aggregate.spec.ts         # Tests
│   │       └── events/
│   │           └── user-registered.event.ts   # Domain event
│   ├── value-objects/
│   │   ├── email.vo.ts                        # Email validation
│   │   ├── email.vo.spec.ts
│   │   ├── plain-password.vo.ts               # Plain password
│   │   ├── plain-password.vo.spec.ts
│   │   ├── hashed-password.vo.ts              # Hashed password
│   │   ├── hashed-password.vo.spec.ts
│   │   ├── user-id.vo.ts                      # User ID
│   │   └── user-id.vo.spec.ts
│   ├── domain-services/
│   │   ├── password-hasher.service.ts         # Hash passwords
│   │   └── password-hasher.service.spec.ts
│   ├── repositories/
│   │   └── user.repository.ts                 # Interface only
│   └── exceptions/
│       ├── domain.exception.ts
│       ├── user-already-exists.exception.ts
│       └── invalid-credentials.exception.ts
│
├── application/
│   └── use-cases/
│       └── register-user/
│           ├── register-user.use-case.ts      # Orchestration
│           ├── register-user.use-case.spec.ts # Tests
│           ├── register-user.dto.ts           # Input DTO
│           └── register-user.result.ts        # Output type
│
└── infrastructure/
    ├── controllers/
    │   ├── auth.controller.ts
    │   ├── auth.controller.spec.ts
    │   └── dtos/
    │       ├── register.request.dto.ts        # HTTP request
    │       └── user.response.dto.ts           # HTTP response
    └── persistence/
        └── typeorm/
            ├── entities/
            │   └── user.entity.ts             # ORM entity
            └── repositories/
                ├── typeorm-user.repository.ts # Implementation
                └── typeorm-user.repository.spec.ts
```

---

## 🔄 Complete Registration Flow

### Step-by-Step Process

1. **HTTP Request arrives** at Controller
   - POST `/auth/register`
   - Body: `{ email: "user@example.com", password: "SecurePass123!" }`

2. **Controller validates DTO** (class-validator)
   - Checks required fields
   - Basic format validation

3. **Controller calls Use Case** with DTO
   - `registerUserUseCase.execute(dto)`

4. **Use Case creates Value Objects**
   - `Email.create(dto.email)` - validates email format
   - `PlainPassword.create(dto.password)` - validates password strength

5. **Use Case checks business rules**
   - `userRepository.findByEmail(email)` - check uniqueness
   - Throws `UserAlreadyExistsException` if exists

6. **Use Case creates User aggregate**
   - `User.create(email, password, passwordHasher)`
   - Domain validates and hashes password

7. **Use Case persists User**
   - `userRepository.save(user)`

8. **Repository maps to ORM entity** and saves to database

9. **Use Case returns result** to Controller

10. **Controller transforms to HTTP response**
    - Maps domain result to `UserResponseDto`
    - Returns HTTP 201 Created

---

## 🔑 Key DDD Principles

### Separation of Concerns

| Layer              | Knows About                             | Doesn't Know About            |
| ------------------ | --------------------------------------- | ----------------------------- |
| **Domain**         | Business rules, entities, value objects | HTTP, databases, frameworks   |
| **Application**    | Domain objects, use case orchestration  | HTTP, database implementation |
| **Infrastructure** | Everything (implements interfaces)      | Business logic details        |

### Dependency Rule

```
Infrastructure → Application → Domain

✅ Infrastructure depends on Application and Domain
✅ Application depends on Domain
❌ Domain depends on NOTHING
```

### Key Concepts

1. **Controller = Thin** - Only HTTP handling, no logic
2. **Use Case = Orchestrator** - Workflow, not business rules
3. **Aggregate = Business Logic** - Rules, validation, state
4. **Repository = Persistence Abstract** - Interface in domain, implementation in infrastructure
5. **Value Objects = Validation** - Email format, password strength
6. **Domain Services = Stateless Logic** - Password hashing, token generation

---

## 🧪 Testing Strategy

### Unit Tests

- **Domain Layer:**
  - Value objects validation (Email, Password)
  - User aggregate business logic
  - Domain services (PasswordHasher)

- **Application Layer:**
  - Use case orchestration
  - Business rule enforcement
  - Mock repositories and domain services

### Integration Tests

- **Infrastructure Layer:**
  - Controller endpoints
  - Repository implementations
  - Database operations

### E2E Tests

- Full registration flow from HTTP request to database persistence

---

## 📝 Implementation Checklist

### Phase 1: Domain Layer

- [ ] Create `UserId` value object
- [ ] Create `Email` value object with validation
- [ ] Create `PlainPassword` value object with strength validation
- [ ] Create `HashedPassword` value object
- [ ] Create `PasswordHasher` domain service
- [ ] Create `User` aggregate root
- [ ] Create `UserRepository` interface
- [ ] Create domain exceptions
- [ ] Write unit tests for all domain components

### Phase 2: Application Layer

- [ ] Create `RegisterUserDto`
- [ ] Create `RegisterUserResult`
- [ ] Create `RegisterUserUseCase`
- [ ] Write unit tests for use case

### Phase 3: Infrastructure Layer

- [ ] Create `RegisterRequestDto` with validation
- [ ] Create `UserResponseDto`
- [ ] Create `AuthController` with registration endpoint
- [ ] Create TypeORM `UserEntity`
- [ ] Create `TypeOrmUserRepository` implementation
- [ ] Write integration tests for controller
- [ ] Write integration tests for repository

### Phase 4: Module Configuration

- [ ] Configure `AuthModule` with dependency injection
- [ ] Set up TypeORM module
- [ ] Configure exception filters
- [ ] Add validation pipes

### Phase 5: Testing & Documentation

- [ ] Write E2E tests
- [ ] Update API documentation
- [ ] Test error scenarios
- [ ] Review and refactor

---

## 🚀 Next Steps

1. Review this plan
2. Get approval to proceed
3. Implement Phase 1 (Domain Layer)
4. Iterate through phases with testing at each step
5. Deploy and monitor

---

## 📚 References

- [DDD Tactical Patterns](../ARCHITECTURE_DECISIONS.md)
- [Hexagonal Architecture Guide](../ARCHITECTURE_DECISIONS.md)
- [Testing Best Practices](.github/instructions/testing.instructions.md)
- [Code Review Standards](.github/instructions/code-review.instructions.md)
