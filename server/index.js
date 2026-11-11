
const path = require('path');

// Load local environment variables
require('dotenv').config({
  path: path.join(__dirname, '.env')
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Import routes and middleware
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const sitemapRoute = require('./routes/sitemapRoute');
const authMiddleware = require('./middleware/authMiddleware');

// CORS: Local frontend + deployed Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map(url => url.trim().replace(/\/$/, ''))
    .filter(Boolean)
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without an Origin header, such as curl
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

// Parse JSON requests
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'TechBlog API is running',
    status: 'healthy'
  });
});

// API routes
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// Dynamic sitemap
app.use('/', sitemapRoute);

// Protected admin profile
app.get('/api/auth/profile', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'Access granted! Admin authenticated.',
    user: req.user
  });
});

// Server configuration
const port = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing.');
  process.exit(1);
}

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(port, '0.0.0.0', () => {
      console.log(`TechBlog server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
