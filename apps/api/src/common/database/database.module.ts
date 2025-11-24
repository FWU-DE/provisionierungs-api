import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvancedSnakeNamingStrategy } from './advanced-snake.naming-strategy';
import databaseConfig, { type DatabaseConfig } from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import { getSpecifiedDatabasePoolSize } from './parallelism';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [databaseConfig.KEY],
      useFactory: (databaseConfig: DatabaseConfig) => ({
        type: 'postgres',
        replication: {
          master: {
            url: databaseConfig.MAIN_URL,
          },
          slaves: [
            {
              url: databaseConfig.REPLICA_URL,
            },
          ],
        },
        autoLoadEntities: true,
        namingStrategy: new AdvancedSnakeNamingStrategy(),
        synchronize: false,
        logging: process.env.LOG_LEVEL === 'debug',
        poolSize: getSpecifiedDatabasePoolSize(),
        extra: {
          idleTimeoutMillis: 25000, // after 25s the connection will be closed if not used
        },
      }),
    }),
  ],
})
export class DatabaseProviderModule {}
