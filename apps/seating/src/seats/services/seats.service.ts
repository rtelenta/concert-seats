import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Seat } from '../entities/seat.entity';
import { SeatStatus } from '../entities/seat-status.enum';

@Injectable()
export class SeatsService {
  constructor(
    @InjectRepository(Seat) private readonly repository: Repository<Seat>,
    private readonly dataSource: DataSource,
  ) {}

  findByShow(showId: string): Promise<Seat[]> {
    return this.repository.findBy({ showId });
  }

  async holdSeats(
    showId: string,
    seatIds: string[],
    userId: string,
  ): Promise<Seat[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock all requested rows; NOWAIT surfaces contention immediately as an error
      const seats = await queryRunner.manager
        .createQueryBuilder(Seat, 'seat')
        .where('seat.seatId IN (:...seatIds)', { seatIds })
        .andWhere('seat.showId = :showId', { showId })
        .setLock('pessimistic_write')
        .getMany();

      if (seats.length !== seatIds.length) {
        throw new NotFoundException(
          'One or more seats not found for this show',
        );
      }

      const unavailable = seats.filter(
        (s) => s.status !== SeatStatus.AVAILABLE,
      );
      if (unavailable.length > 0) {
        throw new ConflictException(
          'One or more seats are not available for holding',
        );
      }

      // Build per-seat (id + version) conditions to guard against stale writes
      const params: Record<string, string | number> = {
        status: SeatStatus.AVAILABLE,
      };
      const versionConditions = seats
        .map((seat, i) => {
          params[`id${i}`] = seat.seatId;
          params[`v${i}`] = seat.version;
          return `(seat_id = :id${i} AND version = :v${i})`;
        })
        .join(' OR ');

      const result = await queryRunner.manager
        .createQueryBuilder()
        .update(Seat)
        .set({
          status: SeatStatus.HELD,
          heldBy: userId,
          heldUntil: () => "NOW() + INTERVAL '5 minutes'",
          version: () => 'version + 1',
        })
        .where(`status = :status AND (${versionConditions})`, params)
        .execute();

      if (result.affected !== seatIds.length) {
        throw new ConflictException(
          'Concurrent modification detected; please retry',
        );
      }

      const updatedSeats = await queryRunner.manager.findBy(Seat, {
        seatId: In(seatIds),
      });

      await queryRunner.commitTransaction();
      return updatedSeats;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
