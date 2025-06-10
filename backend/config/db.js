const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Use DATABASE_URL if available (Render provides this), otherwise use individual variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Fallback to individual variables if DATABASE_URL is not available
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432
});

const setupDatabase = async () => {
  try {
    // Test the connection first
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);
    
    // Create users table (optional, for registered users)
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created/verified');

    // Create transfer_sessions table for P2P file transfers
    console.log('Creating transfer_sessions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transfer_sessions (
        id SERIAL PRIMARY KEY,
        code VARCHAR(6) NOT NULL UNIQUE,
        sender_socket_id VARCHAR(100) NOT NULL,
        receiver_socket_id VARCHAR(100),
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      );
    `);
    console.log('✅ Transfer_sessions table created/verified');

    // Create transfer_stats table for analytics (optional)
    console.log('Creating transfer_stats table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transfer_stats (
        id SERIAL PRIMARY KEY,
        transfer_code VARCHAR(6) NOT NULL,
        file_count INTEGER,
        total_size BIGINT,
        sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Transfer_stats table created/verified');
    
    console.log('🎉 Database setup completed successfully!');
    return true;
  } catch (err) {
    console.error('❌ Error setting up database:');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('Error detail:', err.detail);
    console.error('Full error:', err);
    console.log('🔄 Will use memory storage for this session');
    return false;
  }
};

module.exports = { pool, setupDatabase };
