import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { KafkaProducer } from '@app/kafka';
import { EVENT_TYPES, SeatHoldExpiredPayload, TOPICS } from '@app/contracts';

@Injectable()
export class SeatHoldExpiredProducer {
  constructor(private readonly kafkaProducer: KafkaProducer) {}

  async emit(
    showId: string,
    holderId: string,
    seatIds: string[],
  ): Promise<void> {
    const payload: SeatHoldExpiredPayload = {
      showId,
      bookingId: holderId,
      seatIds,
    };

    await this.kafkaProducer.publish<SeatHoldExpiredPayload>(
      TOPICS.SEATING,
      showId,
      {
        eventId: randomUUID(),
        eventType: EVENT_TYPES.SeatHoldExpired,
        occurredAt: new Date().toISOString(),
        correlationId: randomUUID(),
        version: 1,
        payload,
      },
    );
  }
}
