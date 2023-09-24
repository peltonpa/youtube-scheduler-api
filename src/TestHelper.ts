import express from 'express';
import { DataSource } from 'typeorm';
import { createDatabase } from 'typeorm-extension';
import { TestDataSource } from './data-source';

export class TestHelper {
  private _app: express.Application;
  private _connection: DataSource;

  public get app() {
    return this._app;
  }

  public async init(): Promise<void> {
    await this.startup();
  }

  public async close(): Promise<void> {
    await this._connection.destroy();
  }

  private async startup(): Promise<void> {
    try {
      this._connection = TestDataSource;
      await this._connection.initialize();
      await createDatabase({
        options: {
          type: 'postgres',
          database: process.env.DB_NAME,
        },
      });
      await this._connection.runMigrations();
      this._app = express();
    } catch (error) {
      console.error('testing error', error);
    }
  }
}
