import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsToSeats1782364380000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE seats
        ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE seats
        DROP COLUMN created_at,
        DROP COLUMN updated_at
    `);
  }
}
