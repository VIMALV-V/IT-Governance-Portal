const Notification = require("../models/Notification");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const socket = require("../socket");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: process.env.EMAIL_PORT || 587,
  auth: {
    user: process.env.EMAIL_USER || "test@ethereal.email",
    pass: process.env.EMAIL_PASS || "password"
  }
});

const sendNotification = async (userId, message) => {
  try {
    // 1. Save to DB
    await Notification.create({
      user: userId,
      message
    });

    // 2. Broadcast via WebSockets
    const io = socket.getIO();
    if (io) {
      io.emit("notification", { userId, message });
    }

    // 3. Send Email
    const user = await User.findById(userId);
    if (user && user.email) {
      try {
        await transporter.sendMail({
          from: '"IT Governance" <noreply@itgovernance.com>',
          to: user.email,
          subject: "New IT Governance Notification",
          text: message,
        });
      } catch (emailErr) {
        console.error("Failed to send email to", user.email, emailErr.message);
      }
    }
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

module.exports = sendNotification;
