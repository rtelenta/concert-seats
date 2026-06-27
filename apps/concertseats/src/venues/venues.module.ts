import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VenuesController } from './controllers/venues.controller';
import { VenuesQueryService } from './services/venues-query.service';

@Module({
  imports: [HttpModule],
  controllers: [VenuesController],
  providers: [VenuesQueryService],
})
export class VenuesModule {}
