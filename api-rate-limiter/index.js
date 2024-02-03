const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const port = 3000;

const userLevels = {
  free: { max: 10, windowMs: 60000 },
  pro: { max: 50, windowMs: 30000 },
  premium: { max: 100, windowMs: 15000 },
};

const identifyUserLevel = (req, res, next) => {
  const contributionScore = parseInt(req.headers["x-contribution-score"], 10);
  if (isNaN(contributionScore)) {
    return res
      .status(400)
      .json({ message: "Invalid or missing contribution score header" });
  }
  req.userLevel =
    contributionScore >= 100
      ? "premium"
      : contributionScore >= 50
      ? "pro"
      : "free";
  next();
};

const applyRateLimit = (req, res, next) => {
  const userLevel = req.userLevel;
  const limiter = rateLimit({
    windowMs: userLevels[userLevel].windowMs,
    max: userLevels[userLevel].max,
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
      res
        .status(429)
        .json({ message: `Rate limit exceeded for user level: ${userLevel}` });
    },
  });
  limiter(req, res, next);
};

app.use(helmet());
app.use(express.json());
app.use(identifyUserLevel);
app.post("/ideas", applyRateLimit);

app.get("/ideas", (req, res) => {
  res.json({ ideas: [...ideaData] });
});

app.post("/ideas", (req, res) => {
  const newIdea = req.body;
  ideaData.push(newIdea);
  res.status(201).json({ message: "Idea added successfully" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const ideaData = [
  { id: 1, title: "Improve website loading speed", author: "John Doe" },
  { id: 2, title: "Create a mobile app", author: "Jane Smith" },
];
