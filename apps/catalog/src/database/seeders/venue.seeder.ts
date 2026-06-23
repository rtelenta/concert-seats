import { EntityManager } from 'typeorm';
import { Venue } from '../../venues/venue.entity';

const VENUES: Partial<Venue>[] = [
  {
    id: '01970000-0001-7000-8000-000000000001',
    name: 'The O2 Arena',
    city: 'London',
    capacity: 20000,
  },
  {
    id: '01970000-0001-7000-8000-000000000002',
    name: 'Madison Square Garden',
    city: 'New York',
    capacity: 20789,
  },
];

export async function seedVenues(manager: EntityManager): Promise<void> {
  await manager
    .createQueryBuilder()
    .insert()
    .into(Venue)
    .values(VENUES)
    .orIgnore()
    .execute();
}
