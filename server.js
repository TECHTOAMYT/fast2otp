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
  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStorage[mobile] = otp;

  const message = `Your OTP for verification is ${otp}`;
  
  fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      'authorization': FAST2SMS_API,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      route: 'q',
      message,
      language: 'english',
      flash: 0,
      numbers: mobile
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.return) {
        res.json({ success: true });
      } else {
        res.json({ success: false, message: 'Failed to send OTP. Please try again.' });
      }
    })
    .catch(error => res.json({ success: false, message: error.message }));
});

// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;

  if (otpStorage[mobile] && otpStorage[mobile] == otp) {
    delete otpStorage[mobile];
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
