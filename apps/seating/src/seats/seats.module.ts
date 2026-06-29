import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { SeatsService } from './services/seats.service';
import { SeatExpirationScheduler } from './services/seat-expiration.scheduler';
import { SeatsController } from './controllers/seats.controller';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [TypeOrmModule.forFeature([Seat]), MessagingModule],
  providers: [SeatsService, SeatExpirationScheduler],
  controllers: [SeatsController],
})
export class SeatsModule {}
