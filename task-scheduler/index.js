const cron = require("node-cron");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const birthdays = require("./birthdays.json");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const dailySchedule = "0 9 * * *";

const sendEmail = async (user, message) => {
  const mailOptions = {
    from: '"Birthday Reminder" <no-reply@example.com>',
    to: user.email,
    subject: "Happy Birthday!",
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${user.name}`);
  } catch (error) {
    console.error(`Failed to send email to ${user.name}:`, error);
  }
};

const sendSMS = async (user, message) => {
  console.log(`SMS sent to ${user.name}`);
};

const sendNotifications = async (users) => {
  for (const user of users) {
    const message = `Happy Birthday, ${user.name}!`;
    await sendEmail(user, message);
  }
};

cron.schedule(dailySchedule, async () => {
  const today = new Date();
  const usersWithBirthday = birthdays.filter((user) => {
    const birthdate = new Date(user.birthdate);
    return (
      birthdate.getDate() === today.getDate() &&
      birthdate.getMonth() === today.getMonth()
    );
  });

  if (usersWithBirthday.length > 0) {
    await sendNotifications(usersWithBirthday);
  }
});
