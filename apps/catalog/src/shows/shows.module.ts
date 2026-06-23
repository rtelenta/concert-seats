import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from './show.entity';
import { ShowsService } from './shows.service';

@Module({
  imports: [TypeOrmModule.forFeature([Show])],
  providers: [ShowsService],
  exports: [TypeOrmModule, ShowsService],
})
export class ShowsModule {}
