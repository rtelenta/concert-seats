import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './seat.entity';
import { ShowPublishedConsumer } from './show-published.consumer';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Seat])],
  providers: [ShowPublishedConsumer, SeatsService],
  controllers: [SeatsController],
})
export class SeatsModule {}
