import { EntityManager } from 'typeorm';
import { SeatDefinition } from '../../seat-definitions/entities/seat-definition.entity';

const SHOW_IDS = [
  '01970000-0002-7000-8000-000000000001',
  '01970000-0002-7000-8000-000000000002',
  '01970000-0002-7000-8000-000000000003',
];

const SECTIONS = [
  { name: 'Floor', price: 150.0 },
  { name: 'Balcony', price: 75.0 },
];

const ROWS = ['A', 'B', 'C'];
const SEATS_PER_ROW = 5;

function seedId(counter: number): string {
  return `01970000-0003-7000-8000-${String(counter).padStart(12, '0')}`;
}

function buildFixtures(): Partial<SeatDefinition>[] {
  const fixtures: Partial<SeatDefinition>[] = [];
  let counter = 1;

  for (const showId of SHOW_IDS) {
    for (const section of SECTIONS) {
      for (const row of ROWS) {
        for (let number = 1; number <= SEATS_PER_ROW; number++) {
          fixtures.push({
            id: seedId(counter++),
            showId,
            section: section.name,
            row,
            number,
            price: section.price,
          });
        }
      }
    }
  }

  return fixtures;
}

export async function seedSeatDefinitions(
  manager: EntityManager,
): Promise<void> {
  const fixtures = buildFixtures();
  await manager
    .createQueryBuilder()
    .insert()
    .into(SeatDefinition)
    .values(fixtures)
    .orIgnore()
    .execute();
}
