import express, { Application } from "express";
import resizeRoute from "./routes/resize";
import manipulateRoute from "./routes/manipulate";

const app: Application = express();

app.use("/resize", resizeRoute);
app.use("/manipulate", manipulateRoute);

app.listen(3010, () => {
  console.log("Server is running on port 3010");
});
