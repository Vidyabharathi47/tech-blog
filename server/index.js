
const path = require('path');

// Load environment variables from server/.env
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

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

// Enable CORS
app.use(cors(corsOptions));

// Parse JSON requests
app.use(express.json());

// API Routes
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// Dynamic Sitemap Route
app.use('/', sitemapRoute);

// Home Route
app.get('/', (req, res) => {
  res.send('TechBlog API is running');
});

// Protected Admin Profile Route
app.get('/api/auth/profile', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'Access granted! Admin authenticated.',
    user: req.user
  });
});

// Server Port
const port = process.env.PORT || 5000;

// Check MongoDB environment variable
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing from server/.env');
  process.exit(1);
}

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });
