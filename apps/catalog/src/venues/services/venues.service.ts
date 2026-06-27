import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from '../entities/venue.entity';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
  ) {}

  findAll(): Promise<Venue[]> {
    return this.venueRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Venue> {
    const venue = await this.venueRepository.findOne({ where: { id } });
    if (!venue) {
      throw new NotFoundException(`Venue ${id} not found`);
    }
    return venue;
  }
}
