const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Remove email notification routes
// router.patch('/email-notifications', auth, updateEmailNotifications);
// router.post('/send-instant-email', auth, handleSendInstantEmail);

module.exports = router; 