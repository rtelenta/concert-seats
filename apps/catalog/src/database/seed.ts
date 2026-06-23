import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { seedVenues } from './seeders/venue.seeder';
import { seedShows } from './seeders/show.seeder';
import { seedSeatDefinitions } from './seeders/seat-definition.seeder';

async function main(): Promise<void> {
  await AppDataSource.initialize();
  try {
    await AppDataSource.transaction(async (manager) => {
      await seedVenues(manager);
      await seedShows(manager);
      await seedSeatDefinitions(manager);
    });
    console.log('Seeding complete');
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
