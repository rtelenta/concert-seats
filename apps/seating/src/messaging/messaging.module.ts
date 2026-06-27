import { Module } from '@nestjs/common';
import { ShowPublishedConsumer } from './consumers/show-published.consumer';

@Module({
  providers: [ShowPublishedConsumer],
})
export class MessagingModule {}
