import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Show } from '../shows/show.entity';
import { TimestampedEntity } from '../common/timestamped.entity';

@Entity('venues')
export class Venue extends TimestampedEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'int' })
  capacity: number;

  @OneToMany(() => Show, (show) => show.venue)
  shows: Show[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}
