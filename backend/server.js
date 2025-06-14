const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const memoryStorage = require('./storage/memoryStorage');

// Import routes
const fileRoutes = require('./routes/fileRoutes');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://hubtransfer-frontend.onrender.com', 'https://hubtransfer.onrender.com']
      : '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Database connection
const pool = new Pool(
  process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      }
);

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://hubtransfer-frontend.onrender.com', 'https://hubtransfer.onrender.com']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Make DB and memory storage accessible to routes
app.use((req, res, next) => {
  req.db = pool;
  req.memoryStorage = memoryStorage;
  next();
});

// Routes
app.use('/api/files', fileRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'TransferHub API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Route for receive page (QR code links)
app.get('/receive/:code', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Socket.io connection for real-time file transfers
io.on('connection', (socket) => {
  console.log('New client connected with socket ID:', socket.id);
  
  // Store socket ID for debugging
  socket.socketConnectedAt = new Date().toISOString();
  
  // Generate a 6-digit random code for the sender
  socket.on('generate-code', async () => {
    try {
      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Generating code ${code} for socket ${socket.id}`);
      
      // Try to store in database first, fallback to memory storage
      let session;
      try {
        const result = await pool.query(
          'INSERT INTO transfer_sessions (code, sender_socket_id, created_at, expires_at) VALUES ($1, $2, NOW(), NOW() + INTERVAL \'10 minutes\') RETURNING *',
          [code, socket.id]
        );
        session = result.rows[0];
        console.log('Code stored in database successfully');
      } catch (dbError) {
        console.log('Database not available, using memory storage');
        session = memoryStorage.createTransferSession(code, socket.id);
        console.log('Code stored in memory storage successfully');
      }
      
      // Send the code back to the sender
      socket.emit('code-generated', { code });
      console.log(`Code ${code} sent to client ${socket.id}`);
      
      // Set a timeout to expire the code after 10 minutes
      setTimeout(async () => {
        try {
          // Try database first, then memory storage
          try {
            await pool.query('DELETE FROM transfer_sessions WHERE code = $1', [code]);
          } catch (dbError) {
            memoryStorage.deleteTransferSession(code);
          }
          socket.emit('code-expired', { code });
          console.log(`Code ${code} expired`);
        } catch (error) {
          console.error('Error expiring code:', error);
        }
      }, 10 * 60 * 1000); // 10 minutes in milliseconds
      
    } catch (error) {
      console.error('Error generating code:', error);
      socket.emit('error', { message: 'Failed to generate code' });
    }
  });
  // Handle receiver entering a code
  socket.on('join-room', async (data) => {
    try {
      const { code } = data;
      console.log(`User ${socket.id} attempting to join room with code: ${code}`);
      
      // Find the transfer session with this code
      let session;
      try {
        const result = await pool.query(
          'SELECT * FROM transfer_sessions WHERE code = $1 AND expires_at > NOW()',
          [code]
        );
        session = result.rows[0];
        console.log('Database query result:', session ? 'Session found' : 'No session found');
      } catch (dbError) {
        console.log('Database not available, using memory storage');
        session = memoryStorage.getTransferSession(code);
        console.log('Memory storage result:', session ? 'Session found' : 'No session found');
      }
      
      if (!session) {
        console.log(`Invalid or expired code: ${code}`);
        return socket.emit('error', { message: 'Invalid or expired code' });
      }
      
      const senderSocketId = session.sender_socket_id;
      console.log(`Found session. Sender socket ID: ${senderSocketId}`);
        // Notify the sender that a receiver has joined
      console.log(`Notifying sender ${senderSocketId} that receiver ${socket.id} has joined`);
      io.to(senderSocketId).emit('receiver-joined', { 
        receiverSocketId: socket.id 
      });
      
      // Notify the receiver that they've successfully joined
      console.log(`Notifying receiver ${socket.id} about successful connection to sender ${senderSocketId}`);
      socket.emit('joined-room', { 
        senderSocketId: senderSocketId,
        code 
      });
      
      console.log(`Successfully connected ${socket.id} to sender ${senderSocketId}`);
      
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });
    // Handle WebRTC signaling
  socket.on('signal', (data) => {
    console.log(`Signal from ${socket.id} to ${data.to}`);
    if (data.to && io.sockets.sockets.has(data.to)) {
      io.to(data.to).emit('signal', {
        from: socket.id,
        signal: data.signal
      });
      console.log(`Signal successfully relayed from ${socket.id} to ${data.to}`);
    } else {
      console.log(`Target socket ${data.to} not found or disconnected`);
      socket.emit('error', { message: 'Target peer not found' });
    }
  });
    // Handle transfer complete
  socket.on('transfer-complete', async (data) => {
    try {
      const { code } = data;
      
      // Log the successful transfer
      try {
        await pool.query(
          'UPDATE transfer_sessions SET completed = TRUE WHERE code = $1',
          [code]
        );
        await pool.query('DELETE FROM transfer_sessions WHERE code = $1', [code]);
      } catch (dbError) {
        console.log('Database not available, using memory storage');
        memoryStorage.updateTransferSession(code, { completed: true });
        memoryStorage.deleteTransferSession(code);
      }
      
    } catch (error) {
      console.error('Error completing transfer:', error);
    }
  });
    // Handle disconnect
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    try {
      // Only clean up database if we have a valid connection
      if (process.env.DATABASE_URL || (process.env.DB_HOST && process.env.DB_HOST !== 'localhost')) {
        await pool.query(
          'DELETE FROM transfer_sessions WHERE sender_socket_id = $1 OR receiver_socket_id = $1',
          [socket.id]
        );
        console.log('Database cleanup completed for socket:', socket.id);
      } else {
        console.log('Skipping database cleanup - using memory storage');
        // Clean up memory storage instead
        memoryStorage.cleanupSocketSessions(socket.id);
      }
    } catch (error) {
      console.error('Error cleaning up after disconnect:', error.message);
      // Fallback to memory storage cleanup
      try {
        memoryStorage.cleanupSocketSessions(socket.id);
        console.log('Fallback: Memory storage cleanup completed');
      } catch (memError) {
        console.error('Memory storage cleanup also failed:', memError.message);
      }
    }
  });
});

// Test database connection and initialize
async function initializeDatabase() {
  try {
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Initialize database schema
    const { setupDatabase } = require('./config/db');
    await setupDatabase();
    console.log('✅ Database initialized');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Will use memory storage for this session');
    return false;
  }
}

// Initialize database
initializeDatabase();

// Start server
const PORT = process.env.PORT || 4999;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
