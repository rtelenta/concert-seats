import { Module } from '@nestjs/common';
import { ShowPublishedConsumer } from './consumers/show-published.consumer';
import { SeatHoldExpiredProducer } from './producers/seat-hold-expired.producer';

@Module({
  providers: [ShowPublishedConsumer, SeatHoldExpiredProducer],
  exports: [SeatHoldExpiredProducer],
})
export class MessagingModule {}
