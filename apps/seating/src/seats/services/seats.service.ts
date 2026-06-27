import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seat } from '../entities/seat.entity';

@Injectable()
export class SeatsService {
  constructor(
    @InjectRepository(Seat) private readonly repository: Repository<Seat>,
  ) {}

  findByShow(showId: string): Promise<Seat[]> {
    return this.repository.findBy({ showId });
  }
}
