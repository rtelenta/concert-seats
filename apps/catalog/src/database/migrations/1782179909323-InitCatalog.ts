import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitCatalog1782179909323 implements MigrationInterface {
  name = 'InitCatalog1782179909323';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "venues" ("id" uuid NOT NULL, "name" character varying(255) NOT NULL, "city" character varying(100) NOT NULL, "capacity" integer NOT NULL, CONSTRAINT "PK_cb0f885278d12384eb7a81818be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."show_status" AS ENUM('DRAFT', 'PUBLISHED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shows" ("id" uuid NOT NULL, "venue_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "artist" character varying(255) NOT NULL, "date_time" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."show_status" NOT NULL DEFAULT 'DRAFT', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_db2b12161dbc5081c4f50025669" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "seat_definitions" ("id" uuid NOT NULL, "show_id" uuid NOT NULL, "section" character varying(50) NOT NULL, "row" character varying(10) NOT NULL, "number" integer NOT NULL, "price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f48266c55d90c2bc5e6d30772bc" UNIQUE ("show_id", "section", "row", "number"), CONSTRAINT "PK_ef9b550c8e2e3f046a609619ef7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "shows" ADD CONSTRAINT "FK_d9ffdac680156b5df83652f59b2" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_definitions" ADD CONSTRAINT "FK_90c0d43bd85761f93626ab7d8c8" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "seat_definitions" DROP CONSTRAINT "FK_90c0d43bd85761f93626ab7d8c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shows" DROP CONSTRAINT "FK_d9ffdac680156b5df83652f59b2"`,
    );
    await queryRunner.query(`DROP TABLE "seat_definitions"`);
    await queryRunner.query(`DROP TABLE "shows"`);
    await queryRunner.query(`DROP TYPE "public"."show_status"`);
    await queryRunner.query(`DROP TABLE "venues"`);
  }
}
