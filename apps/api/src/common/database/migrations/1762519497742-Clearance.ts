import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Clearance1762519497742 implements MigrationInterface {
  name = 'Clearance1762519497742';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clearance" DROP CONSTRAINT "UQ_clearance_client_id_group_id_idm_id_school_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "clearance"
                RENAME COLUMN "client_id" TO "offer_id"
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
      ALTER TABLE "clearance"
        RENAME COLUMN "offer_id" TO "client_id"
    `);
    await queryRunner.query(`
            ALTER TABLE "clearance"
            ADD CONSTRAINT "UQ_clearance_client_id_group_id_idm_id_school_id" UNIQUE ("client_id", "idm_id", "school_id", "group_id")
        `);
  }
}
