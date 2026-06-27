import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VenuesQueryService } from '../services/venues-query.service';
import { VenueResponseDto } from '../dtos/venue-response.dto';

@ApiTags('venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesQueryService: VenuesQueryService) {}

  @Get()
  @ApiOperation({ summary: 'List all venues' })
  getVenues(): Promise<VenueResponseDto[]> {
    return this.venuesQueryService.getVenues();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a venue by ID' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  getVenue(@Param('id') id: string): Promise<VenueResponseDto> {
    return this.venuesQueryService.getVenue(id);
  }
}
