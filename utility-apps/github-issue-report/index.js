const express = require("express");
const webhookMiddleware = require("./webhook-listener");

const app = express();

app.use(webhookMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
