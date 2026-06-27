import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from './entities/show.entity';
import { ShowsService } from './services/shows.service';
import { ShowsController } from './controllers/shows.controller';
import { SeatDefinitionsModule } from '../seat-definitions/seat-definitions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Show]), SeatDefinitionsModule],
  controllers: [ShowsController],
  providers: [ShowsService],
  exports: [TypeOrmModule, ShowsService],
})
export class ShowsModule {}
