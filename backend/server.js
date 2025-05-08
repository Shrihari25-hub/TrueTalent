require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();


app.get('/test-email', async (req, res) => {
  const { sendEmail } = require('./utils/emailSender');
  try {
    await sendEmail({
      email: 'your_real_email@example.com', // 👈 Test with your actual email
      subject: 'SMTP Test',
      message: 'This is a test email'
    });
    res.send('Email sent!');
  } catch (err) {
    console.error('SMTP Error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));