import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Clearance1762543760994 implements MigrationInterface {
  name = 'Clearance1762543760994';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clearance" DROP CONSTRAINT "UQ_clearance_group_id_idm_id_offer_id_school_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "clearance" DROP COLUMN "offer_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "clearance"
            ADD "offer_id" integer NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "clearance"
            ADD CONSTRAINT "UQ_clearance_group_id_idm_id_offer_id_school_id" UNIQUE ("offer_id", "idm_id", "school_id", "group_id")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clearance" DROP CONSTRAINT "UQ_clearance_group_id_idm_id_offer_id_school_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "clearance" DROP COLUMN "offer_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "clearance"
            ADD "offer_id" text NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "clearance"
            ADD CONSTRAINT "UQ_clearance_group_id_idm_id_offer_id_school_id" UNIQUE ("offer_id", "idm_id", "school_id", "group_id")
        `);
  }
}
