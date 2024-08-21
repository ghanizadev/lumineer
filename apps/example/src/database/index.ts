import { DataSource } from 'typeorm';
import * as path from 'node:path';

export const getDataSource = async () => {
  const dataSource = new DataSource({
    type: 'mongodb',
    database: 'cymbaline',
    host: 'localhost',
    port: 27017,
    synchronize: true,
    entities: [path.resolve(__dirname, '..', '**', '*.{ts,js}')],
  });

  await dataSource.initialize();

  return dataSource;
};
