import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Show } from '../shows/show.entity';
import { TimestampedEntity } from '../common/timestamped.entity';

@Entity('seat_definitions')
@Unique(['showId', 'section', 'row', 'number'])
export class SeatDefinition extends TimestampedEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'show_id', type: 'uuid' })
  showId: string;

  @ManyToOne(() => Show, (show) => show.seatDefinitions, { nullable: false })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @Column({ type: 'varchar', length: 50 })
  section: string;

  @Column({ name: 'row', type: 'varchar', length: 10 })
  row: string;

  @Column({ type: 'int' })
  number: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}
