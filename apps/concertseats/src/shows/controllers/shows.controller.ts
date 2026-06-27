import { Controller, Get, Param } from '@nestjs/common';
import { ShowsQueryService } from '../services/shows-query.service';
import { ShowResponseDto } from '../dtos/show-response.dto';
import { SeatDefinitionResponseDto } from '../dtos/seat-definition-response.dto';
import { SeatResponseDto } from '../dtos/seat-response.dto';

@Controller('shows')
export class ShowsController {
  constructor(private readonly showsQueryService: ShowsQueryService) {}

  @Get()
  getShows(): Promise<ShowResponseDto[]> {
    return this.showsQueryService.getShows();
  }

  @Get(':id')
  getShow(@Param('id') id: string): Promise<ShowResponseDto> {
    return this.showsQueryService.getShow(id);
  }

  @Get(':id/seat-definitions')
  getSeatDefinitions(
    @Param('id') id: string,
  ): Promise<SeatDefinitionResponseDto[]> {
    return this.showsQueryService.getSeatDefinitions(id);
  }

  @Get(':id/seats')
  getSeats(@Param('id') id: string): Promise<SeatResponseDto[]> {
    return this.showsQueryService.getSeats(id);
  }
}
