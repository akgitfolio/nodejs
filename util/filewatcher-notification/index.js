const fs = require("fs");
const util = require("util");
const nodemailer = require("nodemailer");

const watchDir = "./watch-folder"; // Directory to watch
const emailTo = "your-email@example.com"; // Recipient email address

const transporter = nodemailer.createTransport({
  // Configure your email service credentials here
});

const watchFile = util.promisify(fs.watch);

watchFile(watchDir).then(async (file, eventType) => {
  const eventInfo = util.inspect({ file, eventType });

  const mailOptions = {
    from: "File Watcher <file-watcher@example.com>",
    to: emailTo,
    subject: `File Change Notification: ${file}`,
    text: `File "${file}" was ${eventType}.\n\nEvent details:\n${eventInfo}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent for file change event: ${eventInfo}`);
  } catch (error) {
    console.error("Error sending email notification:", error);
  }
});

console.log(`Watching directory: ${watchDir} for file changes...`);
