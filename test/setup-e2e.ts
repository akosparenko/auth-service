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
