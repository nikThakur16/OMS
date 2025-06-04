require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');  // add mongoose import
const cors = require('cors'); // Import the cors middleware
const app = express();
const authRoutes = require('./routes/authRoutes');

const PORT = process.env.PORT || 5000;

// Configure CORS to allow requests from your frontend origin
const corsOptions = {
  origin: 'http://localhost:3000', // **Allow requests ONLY from your frontend development server**
  methods: 'GET,POST,PUT,DELETE', // Allowed HTTP methods
  credentials: true, // Allow cookies/authentication headers to be sent
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions)); // Use the cors middleware with your options

// Middleware to parse JSON
app.use(express.json());
app.use('/api/auth', authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('OMS Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
