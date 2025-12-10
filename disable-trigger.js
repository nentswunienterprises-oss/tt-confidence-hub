import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new pg.Client(process.env.DATABASE_URL);

client.connect(err => {
  if (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');

  // Drop the trigger
  client.query('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;', (err, res) => {
    if (err) {
      console.error('❌ Error dropping trigger:', err.message);
    } else {
      console.log('✅ Trigger disabled successfully');
    }
    
    client.end(() => {
      process.exit(err ? 1 : 0);
    });
  });
});
