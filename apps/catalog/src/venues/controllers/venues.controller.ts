import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VenuesService } from '../services/venues.service';
import { VenueResponseDto } from '../dtos/venue-response.dto';

@ApiTags('venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Get()
  @ApiOperation({ summary: 'List all venues' })
  async findAll(): Promise<VenueResponseDto[]> {
    const venues = await this.venuesService.findAll();
    return venues.map((venue) => VenueResponseDto.from(venue));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a venue by ID' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async findOne(@Param('id') id: string): Promise<VenueResponseDto> {
    const venue = await this.venuesService.findOne(id);
    return VenueResponseDto.from(venue);
  }
}
