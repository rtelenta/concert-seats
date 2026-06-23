import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Venue } from '../venues/venue.entity';
import { SeatDefinition } from '../seat-definitions/seat-definition.entity';
import { ShowStatus } from './show-status.enum';

@Entity('shows')
export class Show {
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

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => SeatDefinition, (seat) => seat.show)
  seatDefinitions: SeatDefinition[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}
