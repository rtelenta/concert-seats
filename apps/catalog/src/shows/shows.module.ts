import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from './show.entity';
import { ShowsService } from './shows.service';
import { ShowsController } from './shows.controller';
import { SeatDefinitionsModule } from '../seat-definitions/seat-definitions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Show]), SeatDefinitionsModule],
  controllers: [ShowsController],
  providers: [ShowsService],
  exports: [TypeOrmModule, ShowsService],
})
export class ShowsModule {}
