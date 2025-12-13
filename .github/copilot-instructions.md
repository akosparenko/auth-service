# Auth Service - General Instructions

This is a NestJS-based authentication service built with TypeScript.

## Project Overview

- **Framework**: NestJS v11
- **Language**: TypeScript 5.7
- **Testing**: Jest
- **Architecture**: Domain-Driven Design (DDD), Hexagonal Architecture, Clean Architecture

## Code Standards

- Use TypeScript strict mode
- Follow NestJS conventions and best practices
- Use dependency injection extensively
- Prefer async/await over promises
- Use meaningful variable and function names
- One class per file (no exceptions)
- See `code-review.instructions.md` for detailed naming conventions

## File Organization

- Follow NestJS module structure
- Separate concerns: controllers, services, repositories, domain models
- Keep files focused and single-responsibility
- One class per file (no exceptions)
- Group related files in folders, not by type alone

## Testing

- Write unit tests for all services and domain logic
- Write integration tests for API endpoints
- Maintain high test coverage
- Use Jest for all testing

## Commands

- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`
- Format: `npm run format`
- E2E Tests: `npm run test:e2e`
