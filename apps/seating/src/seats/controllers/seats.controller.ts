import { Controller, Get, Param } from '@nestjs/common';
import { SeatsService } from '../services/seats.service';
import { Seat } from '../entities/seat.entity';

@Controller('shows')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get(':id/seats')
  getSeats(@Param('id') id: string): Promise<Seat[]> {
    return this.seatsService.findByShow(id);
  }
}
