import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import helmet from "helmet";

// Create Express app
const app = express();
const PORT = process.env.PORT || 3010;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
app.use(helmet());

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025, // MailHog SMTP port
  secure: false, // Default is false
  debug: true,
});

// Route to send email
app.post("/send-email", (req, res) => {
  const { from, to, subject, html, attachments } = req.body;

  // Compose email
  const mailOptions = {
    from,
    to,
    subject,
    html,
    attachments,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error occurred:", error);
      res.status(500).json({ error: "Failed to send email" });
    } else {
      console.log("Email sent:", info.response);
      res.json({ message: "Email sent successfully" });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
