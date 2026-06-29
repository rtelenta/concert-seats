import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SeatsService } from './seats.service';
import { SeatHoldExpiredProducer } from '../../messaging/producers/seat-hold-expired.producer';

@Injectable()
export class SeatExpirationScheduler {
  private readonly logger = new Logger(SeatExpirationScheduler.name);

  constructor(
    private readonly seatsService: SeatsService,
    private readonly producer: SeatHoldExpiredProducer,
  ) {}

  @Cron('*/30 * * * * *')
  async tick(): Promise<void> {
    let groups: { showId: string; holderId: string; seatIds: string[] }[];
    try {
      groups = await this.seatsService.releaseExpiredHolds();
    } catch (err: unknown) {
      this.logger.error({ err }, 'releaseExpiredHolds failed');
      return;
    }

    if (groups.length === 0) return;

    this.logger.log({ groups: groups.length }, 'released expired holds');

    for (const group of groups) {
      try {
        await this.producer.emit(group.showId, group.holderId, group.seatIds);
      } catch (err: unknown) {
        this.logger.error(
          { showId: group.showId, holderId: group.holderId, err },
          'failed to emit SeatHoldExpired — seats already released',
        );
      }
    }
  }
}
