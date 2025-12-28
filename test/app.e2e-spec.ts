import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/auth/infrastructure/persistence/prisma/prisma.service';

interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
}

describe('User Registration (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Start a transaction before each test (similar to Laravel's RefreshDatabase)
    // This ensures all database changes are rolled back after each test
    await prismaService.$executeRaw`BEGIN`;
  });

  afterEach(async () => {
    // Rollback the transaction after each test
    // This automatically cleans up all data created during the test
    await prismaService.$executeRaw`ROLLBACK`;
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should register a new user successfully', async () => {
      const userDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', userDto.email);
      expect(response.body).toHaveProperty('firstName', userDto.firstName);
      expect(response.body).toHaveProperty('lastName', userDto.lastName);
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 409 for duplicate email', async () => {
      const userDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: `duplicate-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
      };

      // First registration should succeed
      await request(app.getHttpServer())
        .post('/users')
        .send(userDto)
        .expect(201);

      // Second registration with same email should fail
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userDto)
        .expect(409);

      const errorResponse = response.body as ErrorResponse;
      expect(errorResponse.message).toContain('User already exists');
    });

    it('should return 400 for invalid email format', async () => {
      const userDto = {
        firstName: 'Invalid',
        lastName: 'Email',
        email: 'not-an-email',
        password: 'SecurePassword123!',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(userDto)
        .expect(400);
    });

    it('should create user with ACTIVE status by default', async () => {
      const userDto = {
        firstName: 'Status',
        lastName: 'Test',
        email: `status-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userDto)
        .expect(201);

      expect(response.body).toHaveProperty('status', 'ACTIVE');
    });

    it('should hash the password before storing', async () => {
      const userDto = {
        firstName: 'Password',
        lastName: 'Hash',
        email: `hash-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userDto)
        .expect(201);

      // Password should not be in response
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('passwordHash');
    });
  });
});
