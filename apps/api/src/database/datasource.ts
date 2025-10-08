import { DataSource } from 'typeorm';
import { AdvancedSnakeNamingStrategy } from './advanced-snake.naming-strategy';

/**
 * This defines the local datasource for typeorm to generate migrations.
 */

const dataSource = new DataSource({
  type: 'postgres',
  url:
    process.env.DB_MAIN_URL ??
    'postgresql://postgres:postgres@localhost:54320/postgres',
  synchronize: false,
  namingStrategy: new AdvancedSnakeNamingStrategy(),
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/src/database/migrations/*.js'],
});

export default dataSource;
