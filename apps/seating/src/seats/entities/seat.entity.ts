import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  PrimaryColumn,
  Unique,
  VersionColumn,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { SeatStatus } from './seat-status.enum';
import { TimestampedEntity } from '../../common/timestamped.entity';

@Entity('seats')
@Unique(['seatDefinitionId'])
@Index('IDX_seats_show_id', ['showId'])
export class Seat extends TimestampedEntity {
  @PrimaryColumn({ name: 'seat_id', type: 'uuid' })
  seatId: string;

  @Column({ name: 'show_id', type: 'uuid' })
  showId: string;

  @Column({ name: 'seat_definition_id', type: 'uuid' })
  seatDefinitionId: string;

  @Column({ type: 'varchar', length: 50 })
  section: string;

  @Column({ name: 'row', type: 'varchar', length: 10 })
  row: string;

  @Column({ type: 'int' })
  number: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: SeatStatus,
    enumName: 'seat_status',
    default: SeatStatus.AVAILABLE,
  })
  status: SeatStatus;

  @Column({ name: 'held_by', type: 'varchar', nullable: true })
  heldBy: string | null;

  @Column({ name: 'held_until', type: 'timestamptz', nullable: true })
  heldUntil: Date | null;

  @VersionColumn({ type: 'int' })
  version: number;

  @BeforeInsert()
  generateId() {
    if (!this.seatId) {
      this.seatId = uuidv7();
    }
  }
}
