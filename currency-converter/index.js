const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Expense = require("./models/expense");
const currencyConverter = require("./utils/currency");

const app = express();

app.use(bodyParser.json());

mongoose.connect("mongodb://localhost/expenses", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

app.use(
  session({
    secret: "your-secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(function (username, password, done) {
    if (username === "user" && password === "password") {
      return done(null, { id: 1, username: "user" });
    } else {
      return done(null, false, { message: "Incorrect username or password" });
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  if (id === 1) {
    return done(null, { id: 1, username: "user" });
  } else {
    return done(new Error("User not found"));
  }
});

require("./routes/expenses")(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
