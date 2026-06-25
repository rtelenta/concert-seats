import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProcessedEvents1782364260000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE processed_events (
        event_id     VARCHAR(36)              NOT NULL,
        processed_at TIMESTAMPTZ              NOT NULL DEFAULT now(),
        CONSTRAINT pk_processed_events PRIMARY KEY (event_id)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE processed_events');
  }
}
