import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsToCatalog1782364320000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE venues
        ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    `);
    await queryRunner.query(`
      ALTER TABLE seat_definitions
        ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE seat_definitions DROP COLUMN updated_at
    `);
    await queryRunner.query(`
      ALTER TABLE venues
        DROP COLUMN created_at,
        DROP COLUMN updated_at
    `);
  }
}
