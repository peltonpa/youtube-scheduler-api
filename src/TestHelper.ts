import { DataSource } from 'typeorm';
import { FastifyInstance } from 'fastify';
import { TestDataSource } from './data-source';
import build from './app';

export class TestHelper {
  private _app: FastifyInstance;
  private _connection: DataSource;

  public get app() {
    return this._app;
  }

  public async init(): Promise<void> {
    await this.startup();
  }

  public async close(): Promise<void> {
    await this._connection.destroy();
    await this._app.close();
  }

  private async startup(): Promise<void> {
    try {
      console.info('Starting up test server...');
      this._connection = TestDataSource;
      console.info('Connecting...');
      await this._connection.initialize();
      console.info('Launching server...');
      this._app = await build();
    } catch (error) {
      console.error('testing error', error);
    }
  }
}
