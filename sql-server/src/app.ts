import express, { Request, Response } from "express";
import { Pool } from "pg";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3010;

// PostgreSQL connection configuration
const pool = new Pool({
  user: "user",
  host: "localhost",
  database: "northwind",
  password: "password",
  port: 5430,
});

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Execute SQL query and return result
async function executeQuery(query: string, res: Response) {
  try {
    const { rows } = await pool.query(query);
    res.json({ result: rows });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

// Endpoint to execute SQL queries
app.post("/sql", (req: Request, res: Response) => {
  const query: string = req.body.query;
  if (!query) {
    res.status(400).json({ error: "No query provided" });
    return;
  }
  executeQuery(query, res);
});

// Endpoint to handle GET requests (for testing purposes)
app.get("/sql", async (req: Request, res: Response) => {
  try {
    const tablesQuery =
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';";
    const { rows } = await pool.query(tablesQuery);
    res.json({ tables: rows });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
