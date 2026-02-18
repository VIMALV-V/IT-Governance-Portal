const Notification = require("../models/Notification");

const sendNotification = async (userId, message) => {
  try {
    await Notification.create({
      user: userId,
      message
    });
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

module.exports = sendNotification;
