import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Clearance1758725306565 implements MigrationInterface {
  name = 'Clearance1758725306565';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "clearance" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone,
        "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone,
        "deleted_at" TIMESTAMP(3) WITH TIME ZONE,
        "app_id" text NOT NULL,
        "idp_id" text NOT NULL,
        "organization_id" text NOT NULL,
        CONSTRAINT "PK_clearance_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_clearance_deleted_at" ON "clearance" ("deleted_at")
      WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."IDX_clearance_deleted_at"
    `);
    await queryRunner.query(`
      DROP TABLE "clearance"
    `);
  }
}
