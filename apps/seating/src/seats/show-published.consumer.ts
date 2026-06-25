import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { KafkaConsumer } from '@app/kafka';
import {
  EventEnvelope,
  SHOW_EVENTS_TOPIC,
  SHOW_PUBLISHED,
  ShowPublishedPayload,
} from '@app/contracts';
import { Seat } from './seat.entity';
import { SeatStatus } from './seat-status.enum';

@Injectable()
export class ShowPublishedConsumer implements OnModuleInit {
  private readonly logger = new Logger(ShowPublishedConsumer.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumer,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafkaConsumer.subscribe({
      topics: [SHOW_EVENTS_TOPIC],
      handler: (envelope) => this.handle(envelope),
      isProcessed: (eventId) => this.isProcessed(eventId),
      markProcessed: (eventId) => this.markProcessed(eventId),
    });
  }

  private async handle(envelope: EventEnvelope<unknown>): Promise<void> {
    if (envelope.eventType !== SHOW_PUBLISHED) return;

    const payload = envelope.payload as ShowPublishedPayload;
    if (!payload.seats?.length) return;

    const rows = payload.seats.map((seat) => ({
      seatId: uuidv7(),
      showId: payload.showId,
      seatDefinitionId: seat.seatDefinitionId,
      section: seat.section,
      row: seat.row,
      number: seat.number,
      price: seat.price,
      status: SeatStatus.AVAILABLE,
      heldBy: null as string | null,
      heldUntil: null as Date | null,
    }));

    await this.dataSource.transaction(async (em) => {
      await em
        .createQueryBuilder()
        .insert()
        .into(Seat)
        .values(rows)
        .orIgnore()
        .execute();
    });

    this.logger.log(
      { showId: payload.showId, count: rows.length },
      'seats seeded',
    );
  }

  private async isProcessed(eventId: string): Promise<boolean> {
    const rows: unknown[] = await this.dataSource.query(
      'SELECT 1 FROM processed_events WHERE event_id = $1',
      [eventId],
    );
    return rows.length > 0;
  }

  private async markProcessed(eventId: string): Promise<void> {
    await this.dataSource.query(
      'INSERT INTO processed_events (event_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [eventId],
    );
  }
}
