const mongoose = require("mongoose");

async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb://localhost/doc_collaboration", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Successfully connected to database");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

module.exports = connectToDatabase;
