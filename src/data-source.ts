import 'reflect-metadata';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Owner } from './entity/Owner';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  synchronize: true,
  logging: false,
  entities: [User, Owner],
  migrations: [__dirname + '/migration/*.ts'],
  subscribers: [],
});
