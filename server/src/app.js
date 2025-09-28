const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const vendorProcurementRoutes = require('./routes/vendorProcurementRoutes');
const { CustomError } = require('./utils/errors');

const app = express();

// Middleware
// In server/src/app.js - Update CORS for ngrok

app.use(cors({
  origin: [
    'http://localhost:5174',
    'https://96a55ecfb27f.ngrok-free.app', // Add your ngrok URL
    'http://96a55ecfb27f.ngrok-free.app'  // Both http and https
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/vendor-procurement', vendorProcurementRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Vendor Procurement API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle custom errors
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle other errors
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      message: err.message,
      stack: err.stack 
    })
  });
});

module.exports = app;