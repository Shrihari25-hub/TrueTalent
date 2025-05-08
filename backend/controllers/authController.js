const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/jwt');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailSender');

// @desc    Register user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role
    if (!role || !['client', 'freelancer'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select a valid role (client or freelancer)' 
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide an email and password' 
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = user.getSignedJwtToken();
    res.status(200).json({
      success: true,
      token,
      role: user.role, // Add this line
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Add to forgotPassword controller
exports.forgotPassword = async (req, res) => {
  try {
    // 1. Find user (replace mock with your actual DB query)
    const user = await User.findOne({ email: req.body.email }); // 👈 Use your real User model
    if (!user) {
      return res.status(200).json({ 
        success: true, // Prevents email enumeration
        message: 'If the email exists, a reset link has been sent'
      });
    }

    // 2. Generate token (ensure this matches your User model method)
    const resetToken = user.getResetPasswordToken(); // 👈 From userSchema.methods
    await user.save({ validateBeforeSave: false });

    // 3. Send email (critical fix: await + error handling)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    await sendEmail({ // 👈 Now properly imported/exported
      email: user.email,
      subject: 'Password Reset',
      message: `Click to reset: ${resetUrl}`
    });

    res.status(200).json({ 
      success: true,
      message: 'Email sent successfully' 
    });

  } catch (err) {
    console.error("Forgot password error:", err); // 👈 Log full error
    res.status(500).json({
      success: false,
      message: err.message || 'Email failed to send' // 👈 Show actual error
    });
  }
};

// @desc    Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};