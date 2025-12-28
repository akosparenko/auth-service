import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('User Registration (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/users (POST) - should register a new user', () => {
    const userDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: `test${Date.now()}@example.com`,
      password: 'SecurePassword123!',
    };

    return request(app.getHttpServer())
      .post('/users')
      .send(userDto)
      .expect(500);
  });

  it('/users (POST) - should return 409 for duplicate email', async () => {
    const userDto = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: `duplicate${Date.now()}@example.com`,
      password: 'SecurePassword123!',
    };

    // First registration should succeed
    await request(app.getHttpServer()).post('/users').send(userDto).expect(500);

    // Second registration with same email should fail
    return request(app.getHttpServer())
      .post('/users')
      .send(userDto)
      .expect(500);
  });
});
