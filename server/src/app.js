const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const vendorProcurementRoutes = require('./routes/vendorProcurementRoutes');
const { CustomError } = require('./utils/errors');

const app = express();

// Middleware with dynamic CORS - no need to hardcode ngrok URLs
app.use(cors({
  origin: (origin, callback) => {
    // Log for debugging (optional - remove in production)
    console.log('Request from origin:', origin);
    
    // Allow requests with no origin (Postman, server-to-server, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Explicitly allowed origins
    const allowedOrigins = [
      'http://localhost:5174',     // Your Vite dev server
      'http://127.0.0.1:5174',
    ];
    
    // Check if origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow ANY ngrok domain (both http and https)
    // This covers ngrok.io, ngrok-free.app, and ngrok.app
    if (origin.includes('ngrok.io') || 
        origin.includes('ngrok-free.app') || 
        origin.includes('ngrok.app')) {
      return callback(null, true);
    }
    
    // If origin doesn't match, block it
    console.log('Blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true  // Include if you need cookies/sessions
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