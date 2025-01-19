const express = require('express');
const cors = require('cors'); // Add this for handling CORS
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS to allow requests from your frontend
app.use(bodyParser.json());

const FAST2SMS_API_KEY = 'qrg9QGZ18LtpWfhnCSx3H56XDzelKaVOscPNybJEUYB2FTIAo4Zd0YnFWH8kOK1yCfxjcBVsqiX3zv2l'; // Replace with your Fast2SMS API Key

// In-memory OTP storage (for simplicity)
let otpStorage = {};

// Endpoint to send OTP
app.post('/send-otp', (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.json({ success: false, message: 'Mobile number is required' });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStorage[mobile] = otp; // Save the OTP against the mobile number

  // Construct Fast2SMS API URL
  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&route=otp&variables_values=${otp}&flash=1&numbers=${mobile}`;

  // Send the OTP using Fast2SMS
  fetch(url, { method: 'GET' })
    .then(response => response.json())
    .then(data => {
      if (data.return) {
        res.json({ success: true, message: 'OTP sent successfully' });
      } else {
        res.json({ success: false, message: data.message || 'Failed to send OTP. Please try again.' });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      res.json({ success: false, message: 'An error occurred while sending OTP.' });
    });
});

// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;

  if (!otpStorage[mobile]) {
    return res.json({ success: false, message: 'OTP not found or expired' });
  }

  if (otpStorage[mobile] == otp) {
    delete otpStorage[mobile]; // Clear OTP after successful verification
    res.json({ success: true, message: 'Mobile number verified successfully' });
  } else {
    res.json({ success: false, message: 'Invalid OTP. Please try again.' });
  }
});

// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app; // Required for Vercel deployment
