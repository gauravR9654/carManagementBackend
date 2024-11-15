const express = require('express');
const mongoose = require('mongoose');
const carsRouter = require('./routes/createCars/index'); // Import the cars route
const authRoutes = require('./routes/LoginSign/auth')
const searchQuery = require('./routes/searchQuery/searchQuery')
const connectDB = require('./config/db');
const cors = require('cors');
const app = express(); // Initialize express

// Middleware to parse JSON bodies
app.use(express.json()); 
app.use(cors());
// Connect to MongoDB
connectDB();

// Use the cars router with the `/cars` base path
app.use('/cars', carsRouter);
app.use('/cars', authRoutes);
app.use('/cars', searchQuery);

// Define the server port
const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




module.exports = app;