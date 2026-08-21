require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET === 'supersecretjwtkey123') {
    console.error('FATAL ERROR: JWT_SECRET is not defined, too weak, or using the default value for production.');
    process.exit(1);
  }
}

const app = require('./app');
const { runNotificationGeneration } = require('./controllers/notificationController');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Automatically scan for events and generate notifications every minute
  setInterval(async () => {
    try {
      await runNotificationGeneration();
    } catch (error) {
      console.error('Background notification generator error:', error);
    }
  }, 60 * 1000);
});
