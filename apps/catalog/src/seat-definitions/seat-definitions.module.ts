import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatDefinition } from './entities/seat-definition.entity';
import { SeatDefinitionsService } from './services/seat-definitions.service';

@Module({
  imports: [TypeOrmModule.forFeature([SeatDefinition])],
  providers: [SeatDefinitionsService],
  exports: [SeatDefinitionsService],
})
export class SeatDefinitionsModule {}
