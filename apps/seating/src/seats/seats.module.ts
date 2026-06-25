import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './seat.entity';
import { ShowPublishedConsumer } from './show-published.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([Seat])],
  providers: [ShowPublishedConsumer],
})
export class SeatsModule {}
