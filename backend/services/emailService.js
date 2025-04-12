const nodemailer = require('nodemailer');
const Task = require('../models/Task');
const User = require('../models/User');
const { format } = require('date-fns');

// Create a transporter using your email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const generateEmailContent = (tasks) => {
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const pendingTasks = tasks.filter(task => task.status === 'pending');

  return `
    <h2>Your Daily Task Summary</h2>
    <p>Here's an overview of your tasks as of ${format(new Date(), 'MMMM dd, yyyy')}:</p>
    
    <h3>Completed Tasks (${completedTasks.length})</h3>
    <ul>
      ${completedTasks.map(task => `<li>${task.title}</li>`).join('')}
    </ul>
    
    <h3>In Progress Tasks (${inProgressTasks.length})</h3>
    <ul>
      ${inProgressTasks.map(task => `<li>${task.title} - Due: ${format(new Date(task.dueDateTime), 'MMM dd, HH:mm')}</li>`).join('')}
    </ul>
    
    <h3>Pending Tasks (${pendingTasks.length})</h3>
    <ul>
      ${pendingTasks.map(task => `<li>${task.title} - Due: ${format(new Date(task.dueDateTime), 'MMM dd, HH:mm')}</li>`).join('')}
    </ul>
  `;
};

const sendDailyEmail = async () => {
  try {
    const users = await User.find({ 'emailNotifications.daily': true });
    
    for (const user of users) {
      const tasks = await Task.find({ user: user._id });
      
      if (tasks.length > 0) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Your Daily Task Summary',
          html: generateEmailContent(tasks)
        };

        await transporter.sendMail(mailOptions);
      }
    }
  } catch (error) {
    console.error('Error sending daily emails:', error);
    throw error;
  }
};

const sendInstantEmail = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.emailNotifications.instant) {
      throw new Error('User not found or instant notifications disabled');
    }

    const tasks = await Task.find({ user: userId });
    
    if (tasks.length > 0) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Your Current Task Summary',
        html: generateEmailContent(tasks)
      };

      await transporter.sendMail(mailOptions);
      return { message: 'Email sent successfully' };
    } else {
      return { message: 'No tasks to send' };
    }
  } catch (error) {
    console.error('Error sending instant email:', error);
    throw error;
  }
};

module.exports = {
  sendDailyEmail,
  sendInstantEmail
}; 