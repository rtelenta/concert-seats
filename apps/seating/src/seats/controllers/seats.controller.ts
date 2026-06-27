import { Controller, Get, Param } from '@nestjs/common';
import { SeatsService } from '../services/seats.service';
import { SeatResponseDto } from '../dtos/seat-response.dto';

@Controller('shows')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get(':id/seats')
  async getSeats(@Param('id') id: string): Promise<SeatResponseDto[]> {
    const seats = await this.seatsService.findByShow(id);
    return seats.map((seat) => SeatResponseDto.from(seat));
  }
}
