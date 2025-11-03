import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Clearance1760456885557 implements MigrationInterface {
  name = 'Clearance1760456885557';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clearance"
                RENAME COLUMN "organization_id" TO "group_id"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clearance"
                RENAME COLUMN "group_id" TO "organization_id"
        `);
  }
}
