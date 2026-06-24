import { Controller, Get, Param } from '@nestjs/common';
import { ShowsService } from './shows.service';
import { SeatDefinitionsService } from '../seat-definitions/seat-definitions.service';
import { ShowResponseDto } from './dto/show-response.dto';
import { SeatDefinitionResponseDto } from '../seat-definitions/dto/seat-definition-response.dto';

@Controller('shows')
export class ShowsController {
  constructor(
    private readonly showsService: ShowsService,
    private readonly seatDefinitionsService: SeatDefinitionsService,
  ) {}

  @Get()
  async findAll(): Promise<ShowResponseDto[]> {
    const shows = await this.showsService.findAllPublished();
    return shows.map((show) => ShowResponseDto.from(show));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ShowResponseDto> {
    const show = await this.showsService.findOne(id);
    return ShowResponseDto.from(show);
  }

  @Get(':id/seats')
  async findSeats(
    @Param('id') id: string,
  ): Promise<SeatDefinitionResponseDto[]> {
    await this.showsService.findOne(id);
    const seats = await this.seatDefinitionsService.findByShowId(id);
    return seats.map((seat) => SeatDefinitionResponseDto.from(seat));
  }
}
