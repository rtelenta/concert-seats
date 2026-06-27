import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ShowsController } from './controllers/shows.controller';
import { ShowsQueryService } from './services/shows-query.service';

@Module({
  imports: [HttpModule],
  controllers: [ShowsController],
  providers: [ShowsQueryService],
})
export class ShowsModule {}
