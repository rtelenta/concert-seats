import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeatDefinition } from '../entities/seat-definition.entity';

@Injectable()
export class SeatDefinitionsService {
  constructor(
    @InjectRepository(SeatDefinition)
    private readonly repo: Repository<SeatDefinition>,
  ) {}

  findByShowId(showId: string): Promise<SeatDefinition[]> {
    return this.repo.find({ where: { showId } });
  }
}
