require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');  // add mongoose import
const app = express();
const authRoutes = require('./routes/authRoutes');

const PORT = process.env.PORT || 3000;

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
