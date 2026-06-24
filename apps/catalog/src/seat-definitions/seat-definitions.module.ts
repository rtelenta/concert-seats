import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatDefinition } from './seat-definition.entity';
import { SeatDefinitionsService } from './seat-definitions.service';

@Module({
  imports: [TypeOrmModule.forFeature([SeatDefinition])],
  providers: [SeatDefinitionsService],
  exports: [SeatDefinitionsService],
})
export class SeatDefinitionsModule {}
