import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './entities/venue.entity';
import { VenuesController } from './controllers/venues.controller';
import { VenuesService } from './services/venues.service';

@Module({
  imports: [TypeOrmModule.forFeature([Venue])],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [TypeOrmModule],
})
export class VenuesModule {}
