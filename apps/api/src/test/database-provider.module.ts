import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvancedSnakeNamingStrategy } from '../database/advanced-snake.naming-strategy';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: 'localhost',
        port: parseInt(process.env.POSTGRES_PORT ?? '5432'),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        autoLoadEntities: true,
        namingStrategy: new AdvancedSnakeNamingStrategy(),
        synchronize: false,
        logging: process.env.LOG_LEVEL === 'debug',
        entities: ['**/*.entity.ts'],
        migrations: ['database/migrations/*.ts'],
      }),
    }),
  ],
})
export class TestDatabaseProviderModule {}
