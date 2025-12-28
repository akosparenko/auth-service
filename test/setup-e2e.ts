import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

beforeAll(async () => {
  process.env.DATABASE_URL =
    'postgresql://authuser:authpassword@localhost:5432/authdb_test?schema=public';

  // Create test database if doesn't exist
  try {
    await execAsync('npx prisma migrate deploy');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}, 30000);

afterAll(async () => {
  // Clean up test database
  try {
    const { PrismaClient } = await import('@prisma/client');
    const { PrismaPg } = await import('@prisma/adapter-pg');
    const { Pool } = await import('pg');

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await pool.end();
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
});
