import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Venue } from '../../venues/entities/venue.entity';
import { SeatDefinition } from '../../seat-definitions/entities/seat-definition.entity';
import { ShowStatus } from './show-status.enum';
import { TimestampedEntity } from '../../common/timestamped.entity';

@Entity('shows')
export class Show extends TimestampedEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'venue_id', type: 'uuid' })
  venueId: string;

  @ManyToOne(() => Venue, (venue) => venue.shows, { nullable: false })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  artist: string;

  @Column({ name: 'date_time', type: 'timestamptz' })
  dateTime: Date;

  @Column({
    type: 'enum',
    enum: ShowStatus,
    enumName: 'show_status',
    default: ShowStatus.DRAFT,
  })
  status: ShowStatus;

  @OneToMany(() => SeatDefinition, (seat) => seat.show)
  seatDefinitions: SeatDefinition[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}
