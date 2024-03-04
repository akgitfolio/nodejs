import express from "express";
import cors from "cors";
import routes from "./routes";
import sequelize from "./database";

const app = express();
const port = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());
app.use("/api", routes);

sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
