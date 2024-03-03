import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import router from "./routes";
dotenv.config();

const app = express();


const port = process.env["APP_PORT"] || 3000;
const env = process.env["APP_ENV"] || "dev";

app.use(cors());
app.use(helmet());
app.use(morgan(env));
app.use(express.json());

app.use("/", router);

app.listen(port, () => {
  console.log(`Express server is listening at http://localhost:${port} 🚀`);
})