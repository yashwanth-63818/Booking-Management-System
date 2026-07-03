require('dotenv').config();
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
