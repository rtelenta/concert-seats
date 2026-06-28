import { Module } from '@nestjs/common';
import { VenuesController } from './controllers/venues.controller';
import { VenuesQueryService } from './services/venues-query.service';

@Module({
  controllers: [VenuesController],
  providers: [VenuesQueryService],
})
export class VenuesModule {}
