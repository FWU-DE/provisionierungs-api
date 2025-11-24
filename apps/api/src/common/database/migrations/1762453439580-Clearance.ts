import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Clearance1762453439580 implements MigrationInterface {
  name = 'Clearance1762453439580';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "clearance" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone,
                "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone,
                "deleted_at" TIMESTAMP(3) WITH TIME ZONE,
                "client_id" text NOT NULL,
                "idm_id" text NOT NULL,
                "school_id" text NOT NULL,
                "group_id" text NOT NULL,
                CONSTRAINT "UQ_clearance_client_id_group_id_idm_id_school_id" UNIQUE ("client_id", "idm_id", "school_id", "group_id"),
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
