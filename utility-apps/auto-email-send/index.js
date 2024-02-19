const nodemailer = require("nodemailer");
const ejs = require("ejs");
const mysql = require("mysql");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your_email_address",
    pass: "your_email_password",
  },
});

const connection = mysql.createConnection({
  host: "localhost",
  user: "username",
  password: "password",
  database: "bookstore_db",
});

async function getUserData(userId) {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM users WHERE id = ?",
      [userId],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0]);
        }
      }
    );
  });
}

async function getPurchaseHistory(userId) {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM orders WHERE user_id = ?",
      [userId],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });
}

async function getBrowsingHistory(userId) {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM browsing_history WHERE user_id = ?",
      [userId],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });
}

function generateRecommendations(purchaseHistory, browsingHistory) {
  return [
    { title: "Book 1", author: "Author 1", url: "http://example.com/book1" },
    { title: "Book 2", author: "Author 2", url: "http://example.com/book2" },
  ];
}

async function sendPersonalizedEmail(userId) {
  try {
    const userData = await getUserData(userId);
    const purchaseHistory = await getPurchaseHistory(userId);
    const browsingHistory = await getBrowsingHistory(userId);
    const recommendations = generateRecommendations(
      purchaseHistory,
      browsingHistory
    );
    const emailContent = await ejs.renderFile("template.ejs", {
      user_name: userData.name,
      recommendations: recommendations,
    });

    await transporter.sendMail({
      from: "your_email_address",
      to: userData.email,
      subject: "Personalized Book Recommendations for You",
      html: emailContent,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

sendPersonalizedEmail(1);
