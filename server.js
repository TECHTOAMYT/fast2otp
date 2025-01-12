const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const FAST2SMS_API = 'qrg9QGZ18LtpWfhnCSx3H56XDzelKaVOscPNybJEUYB2FTIAo4Zd0YnFWH8kOK1yCfxjcBVsqiX3zv2l';

let otpStorage = {};

// Endpoint to send OTP
app.post('/send-otp', (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.json({ success: false, message: 'Mobile number is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStorage[mobile] = otp;

  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API}&route=otp&variables_values=${otp}&flash=1&numbers=${mobile}`;

  fetch(url, { method: 'GET' })
    .then(response => response.json())
    .then(data => {
      if (data.return) {
        res.json({ success: true, message: 'OTP sent successfully' });
      } else {
        res.json({ success: false, message: 'Failed to send OTP. Please try again.' });
      }
    })
    .catch(error => res.json({ success: false, message: error.message }));
});

// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;

  if (!otpStorage[mobile]) {
    return res.json({ success: false, message: 'OTP not found or expired' });
  }

  if (otpStorage[mobile] == otp) {
    delete otpStorage[mobile];
    res.json({ success: true, message: 'Mobile number verified successfully' });
  } else {
    res.json({ success: false, message: 'Invalid OTP' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
