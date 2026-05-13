const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dragon-catcher', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => console.log('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const dragonRoutes = require('./routes/dragons');

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/dragons', dragonRoutes);

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('New player connected:', socket.id);
  
  socket.on('player-move', (data) => {
    io.emit('player-position', { id: socket.id, ...data });
  });
  
  socket.on('dragon-catch', (data) => {
    io.emit('dragon-caught', { player: socket.id, ...data });
  });
  
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    io.emit('player-left', { id: socket.id });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
