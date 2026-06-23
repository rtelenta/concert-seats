import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatDefinition } from './seat-definition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SeatDefinition])],
  exports: [TypeOrmModule],
})
export class SeatDefinitionsModule {}
