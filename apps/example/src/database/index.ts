import { DataSource } from 'typeorm';
import * as path from 'node:path';
import { Logger } from '@lumineer/logger';

export class DatabaseConnection extends DataSource {
  private readonly customLogger: Logger;

  constructor() {
    super({
      type: 'mongodb',
      database: 'lumineer',
      host: 'localhost',
      port: 27017,
      synchronize: true,
      entities: [path.resolve(__dirname, '..', '**', '*.{ts,js}')],
      logging: ['info'],
    });

    this.customLogger = new Logger('Typeorm', 'bgYellow');
  }

  static async configure(): Promise<DatabaseConnection> {
    const instance = new DatabaseConnection();
    await instance
      .initialize()
      .then(() => {
        instance.customLogger.info('Connected successfully');
      })
      .catch((e) => {
        instance.customLogger.error('Failed to connect, reason: ' + e.message);
      });
    return instance;
  }
}
