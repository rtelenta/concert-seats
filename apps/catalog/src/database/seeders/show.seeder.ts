import { EntityManager } from 'typeorm';
import { Show } from '../../shows/show.entity';
import { ShowStatus } from '../../shows/show-status.enum';

const SHOWS: Partial<Show>[] = [
  {
    id: '01970000-0002-7000-8000-000000000001',
    venueId: '01970000-0001-7000-8000-000000000001',
    title: 'Solar Eclipse Tour',
    artist: 'The Weeknd',
    dateTime: new Date('2026-09-15T20:00:00Z'),
    status: ShowStatus.PUBLISHED,
  },
  {
    id: '01970000-0002-7000-8000-000000000002',
    venueId: '01970000-0001-7000-8000-000000000001',
    title: 'Music of the Spheres',
    artist: 'Coldplay',
    dateTime: new Date('2026-10-01T19:30:00Z'),
    status: ShowStatus.PUBLISHED,
  },
  {
    id: '01970000-0002-7000-8000-000000000003',
    venueId: '01970000-0001-7000-8000-000000000002',
    title: 'Eras Tour Revival',
    artist: 'Taylor Swift',
    dateTime: new Date('2026-11-20T19:00:00Z'),
    status: ShowStatus.PUBLISHED,
  },
];

export async function seedShows(manager: EntityManager): Promise<void> {
  await manager
    .createQueryBuilder()
    .insert()
    .into(Show)
    .values(SHOWS)
    .orIgnore()
    .execute();
}
