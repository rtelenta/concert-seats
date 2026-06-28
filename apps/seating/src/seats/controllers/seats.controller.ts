import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SeatsService } from '../services/seats.service';
import { SeatResponseDto } from '../dtos/seat-response.dto';
import { HoldSeatsDto } from '../dtos/hold-seats.dto';

@ApiTags('seats')
@Controller('shows')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get(':id/seats')
  @ApiOperation({ summary: 'List seats for a show' })
  async getSeats(@Param('id') id: string): Promise<SeatResponseDto[]> {
    const seats = await this.seatsService.findByShow(id);
    return seats.map((seat) => SeatResponseDto.from(seat));
  }

  @Post(':showId/seats/hold')
  @HttpCode(200)
  @ApiOperation({ summary: 'Hold seats for a show (all-or-nothing)' })
  @ApiResponse({ status: 200, description: 'All seats held successfully' })
  @ApiResponse({
    status: 409,
    description: 'One or more seats unavailable or concurrent modification',
  })
  @ApiResponse({ status: 404, description: 'One or more seats not found' })
  async holdSeats(
    @Param('showId') showId: string,
    @Body() dto: HoldSeatsDto,
    @Headers('x-user-id') userId: string,
  ): Promise<SeatResponseDto[]> {
    if (!userId) {
      throw new BadRequestException('X-User-Id header is required');
    }
    if (!Array.isArray(dto.seatIds) || dto.seatIds.length === 0) {
      throw new BadRequestException('seatIds must be a non-empty array');
    }
    const seats = await this.seatsService.holdSeats(
      showId,
      dto.seatIds,
      userId,
    );
    return seats.map((seat) => SeatResponseDto.from(seat));
  }
}
