import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Clearance1760951203387 implements MigrationInterface {
  name = 'Clearance1760951203387';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clearance"
            ADD "school_id" text NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clearance" DROP COLUMN "school_id"
        `);
  }
}
