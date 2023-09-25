import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';

const app = express();
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

app.get('/test', (req: Request, res: Response) => {
  res.send('This is a test');
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at ${process.env.PORT}`);
});

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

const connectToDB = async () => {
  try {
    await pool.connect();
  } catch (err) {
    console.log(err);
  }
};
connectToDB();
