const cron = require('node-cron');
const { sendDailyEmail } = require('./services/emailService');

// Schedule daily email at 7 AM
cron.schedule('0 7 * * *', () => {
  console.log('Running daily email task at 7 AM');
  sendDailyEmail();
}); 