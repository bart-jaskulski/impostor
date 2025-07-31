import 'dotenv/config';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './db';

async function main() {
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations ran successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

main();
