import { Module } from '@nestjs/common';
import { ShowsController } from './controllers/shows.controller';
import { ShowsQueryService } from './services/shows-query.service';

@Module({
  controllers: [ShowsController],
  providers: [ShowsQueryService],
})
export class ShowsModule {}
