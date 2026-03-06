import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Clearance1772443757952 implements MigrationInterface {
  name = 'Clearance1772443757952';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "school_clearance" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone,
                "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone,
                "deleted_at" TIMESTAMP(3) WITH TIME ZONE,
                "offer_id" integer NOT NULL,
                "idm_id" text NOT NULL,
                "school_id" text NOT NULL,
                CONSTRAINT "UQ_school_clearance_idm_id_offer_id_school_id" UNIQUE ("offer_id", "idm_id", "school_id"),
                CONSTRAINT "PK_school_clearance_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_school_clearance_deleted_at" ON "school_clearance" ("deleted_at")
            WHERE "deleted_at" IS NULL
        `);
    await queryRunner.query(`
            CREATE TABLE "group_clearance" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone,
                "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone,
                "deleted_at" TIMESTAMP(3) WITH TIME ZONE,
                "offer_id" integer NOT NULL,
                "idm_id" text NOT NULL,
                "school_id" text NOT NULL,
                "group_id" text NOT NULL,
                CONSTRAINT "UQ_group_clearance_group_id_idm_id_offer_id_school_id" UNIQUE ("offer_id", "idm_id", "school_id", "group_id"),
                CONSTRAINT "PK_group_clearance_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_group_clearance_deleted_at" ON "group_clearance" ("deleted_at")
            WHERE "deleted_at" IS NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_group_clearance_deleted_at"
        `);
    await queryRunner.query(`
            DROP TABLE "group_clearance"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_school_clearance_deleted_at"
        `);
    await queryRunner.query(`
            DROP TABLE "school_clearance"
        `);
  }
}
