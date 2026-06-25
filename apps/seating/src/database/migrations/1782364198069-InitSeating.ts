import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSeating1782364198069 implements MigrationInterface {
  name = 'InitSeating1782364198069';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."seat_status" AS ENUM('AVAILABLE', 'HELD', 'SOLD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "seats" ("seat_id" uuid NOT NULL, "show_id" uuid NOT NULL, "seat_definition_id" uuid NOT NULL, "section" character varying(50) NOT NULL, "row" character varying(10) NOT NULL, "number" integer NOT NULL, "price" numeric(10,2) NOT NULL, "status" "public"."seat_status" NOT NULL DEFAULT 'AVAILABLE', "held_by" character varying, "held_until" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, CONSTRAINT "UQ_28767f8a5a72ed1ad6092b56314" UNIQUE ("seat_definition_id"), CONSTRAINT "PK_9d655d853d2fbbb3710831d3ca7" PRIMARY KEY ("seat_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_seats_show_id" ON "seats"  ("show_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_seats_show_id"`);
    await queryRunner.query(`DROP TABLE "seats"`);
    await queryRunner.query(`DROP TYPE "public"."seat_status"`);
  }
}
