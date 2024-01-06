const crypto = require("crypto");
const nodemailer = require("nodemailer");

const algorithm = "aes-256-gcm";
const keyDerivationIterations = 100000;
const digest = "sha256";

// Generate a random key for encryption
function generateKey(password) {
  return crypto.pbkdf2Sync(
    password,
    digest,
    keyDerivationIterations,
    32,
    "sha256"
  );
}

// Encrypt file with AES-GCM algorithm
async function encryptFile(filePath, key, iv) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const input = crypto.createReadStream(filePath);
  const output = crypto.createWriteStream(filePath + ".enc");
  input.pipe(cipher).pipe(output);
  await new Promise((resolve, reject) => {
    output.on("finish", resolve);
    output.on("error", reject);
  });
}

// Function to send email with encrypted file
async function sendEmail(toEmail, subject, message, filePath) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your_email@gmail.com",
      pass: "your_password",
    },
  });

  const mailOptions = {
    from: "your_email@gmail.com",
    to: toEmail,
    subject: subject,
    text: message,
    attachments: [
      {
        filename: filePath + ".enc",
        path: filePath + ".enc",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

// Main function for file encryption and email sending
async function main(password, filePath, recipientEmail) {
  const key = generateKey(password);
  const iv = crypto.randomBytes(12);

  await encryptFile(filePath, key, iv);

  await sendEmail(
    recipientEmail,
    "Encrypted File",
    "Please find the attached encrypted file.",
    filePath + ".enc"
  );

  console.log("File encrypted and sent successfully!");
}

// Example usage
main("your_password", "path/to/file.txt", "recipient@email.com");
