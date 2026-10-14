const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const githubRoutes = require('./routes/githubRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allows Next.js frontend (default port 3000)
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/github', githubRoutes);
app.use('/api/favorites', favoriteRoutes);

// Catch 404 routes and forward to error handler
app.use(notFoundHandler);

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Backend running on port ${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
});
