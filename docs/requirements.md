# Auth Service - Functional Requirements

**Last Updated**: 2025-12-13

## Overview

A microservices-ready authentication service built with NestJS for web environments. Stateless, JWT-based authentication with role-based access control.

---

## Core Functional Requirements

### 1. User Management

#### 1.1 User Registration

- **Endpoint**: `POST /auth/register`
- **Input**: Email, password, firstName, lastName
- **Validations**:
  - Email format validation
  - Password strength (min 8 chars, uppercase, lowercase, number, special char)
  - Duplicate email check
- **Output**: User object (without password), success message
- **Optional**: Send email verification link

#### 1.2 User Profile

- **Endpoint**: `GET /auth/profile`
- **Auth**: Requires valid JWT access token
- **Output**: User profile (id, email, roles, metadata)

#### 1.3 Email Verification (Optional - Phase 2)

- **Endpoint**: `POST /auth/verify-email`
- **Input**: Verification token
- **Output**: Success/failure message

---

### 2. Authentication

#### 2.1 Login

- **Endpoint**: `POST /auth/login`
- **Input**: Email, password
- **Output**:
  - Access token (JWT, 15min expiry)
  - Refresh token (JWT, 7 days expiry)
  - User object
- **Security**: Rate limiting (max 5 attempts per 15min per IP)

#### 2.2 Logout

- **Endpoint**: `POST /auth/logout`
- **Auth**: Requires valid JWT
- **Action**: Invalidate/blacklist refresh token
- **Output**: Success message

#### 2.3 Token Refresh

- **Endpoint**: `POST /auth/refresh`
- **Input**: Refresh token
- **Output**: New access token + new refresh token
- **Validation**: Check refresh token validity and expiry

---

### 3. Authorization

#### 3.1 Token Validation (for Microservices)

- **Endpoint**: `POST /auth/validate`
- **Input**: Access token
- **Output**: Token payload (userId, email, roles) or error
- **Use Case**: Other microservices call this to verify user tokens

#### 3.2 Role-Based Access Control (RBAC)

- **Default Roles**: `user`, `admin`, `moderator`
- **Token Payload Includes**:
  ```json
  {
    "sub": "userId",
    "email": "user@example.com",
    "roles": ["user"],
    "iat": 1234567890,
    "exp": 1234568790
  }
  ```
- **Guards**: Role-based guards for protected endpoints

---

### 4. Security Requirements

#### 4.1 Password Security

- Hash algorithm: **bcrypt** (salt rounds: 10)
- Never store plain text passwords
- Never return password hash in API responses

#### 4.2 JWT Configuration

- **Access Token**:
  - Expiry: 15 minutes
  - Type: Bearer token
  - Algorithm: HS256 or RS256
- **Refresh Token**:
  - Expiry: 7 days
  - Stored in database with user reference
  - Single-use or family rotation strategy

#### 4.3 Rate Limiting

- Login endpoint: 5 attempts per 15 minutes per IP
- Registration: 3 attempts per hour per IP
- Token refresh: 10 attempts per minute per user

#### 4.4 CORS

- Configure allowed origins for web clients
- Environment-specific configuration

---

### 5. Microservices Integration

#### 5.1 Health Check

- **Endpoint**: `GET /health`
- **Output**: Service status, database connectivity, timestamp

#### 5.2 Stateless Design

- No server-side sessions
- All authentication via JWT tokens
- Horizontal scaling friendly

#### 5.3 Inter-Service Communication

- Provide validation endpoint for other services
- Optional: Service-to-service authentication via API keys

---

## Technical Stack

### Database

- **Primary**: PostgreSQL
- **Entities**:
  - `users` (id, email, password_hash, roles, created_at, updated_at, email_verified)
  - `refresh_tokens` (id, user_id, token_hash, expires_at, created_at)

### Libraries & Packages

- `@nestjs/jwt` - JWT generation/validation
- `@nestjs/passport` + `passport-jwt` - Authentication strategy
- `bcrypt` - Password hashing
- `class-validator` + `class-transformer` - DTO validation
- `@nestjs/typeorm` + `pg` - Database ORM
- `@nestjs/throttler` - Rate limiting
- `@nestjs/config` - Environment configuration

### Optional (Phase 2)

- **Redis**: Token blacklisting, rate limiting cache
- **Email Service**: NodeMailer or SendGrid for verification emails

---

## API Endpoints Summary

| Method | Endpoint       | Auth Required | Description                   |
| ------ | -------------- | ------------- | ----------------------------- |
| POST   | /auth/register | No            | Create new user account       |
| POST   | /auth/login    | No            | Login and get tokens          |
| POST   | /auth/logout   | Yes           | Invalidate refresh token      |
| POST   | /auth/refresh  | No            | Get new access token          |
| GET    | /auth/profile  | Yes           | Get current user profile      |
| POST   | /auth/validate | No            | Validate token (for services) |
| GET    | /health        | No            | Health check                  |

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=auth_service

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:4200

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

---

## Implementation Phases

### Phase 1 (MVP) - Core Features

- [x] Project setup
- [ ] Database setup (PostgreSQL + TypeORM)
- [ ] User entity and repository
- [ ] Registration endpoint
- [ ] Login endpoint (with JWT)
- [ ] Token refresh endpoint
- [ ] Profile endpoint
- [ ] Token validation endpoint
- [ ] Password hashing
- [ ] Basic error handling

### Phase 2 - Security & Enhancement

- [ ] Rate limiting
- [ ] Email verification
- [ ] Logout with token blacklisting
- [ ] RBAC guards and decorators
- [ ] Comprehensive error handling
- [ ] API documentation (Swagger)

### Phase 3 - Production Ready

- [ ] Unit tests (>80% coverage)
- [ ] E2E tests
- [ ] Redis integration for token blacklist
- [ ] Logging and monitoring
- [ ] Docker setup
- [ ] CI/CD pipeline

---

## Notes

- Keep tokens short-lived to minimize security risks
- Always validate input data with DTOs
- Use environment variables for all secrets
- Implement proper error handling (don't leak sensitive info)
- Consider implementing password reset flow in Phase 2
