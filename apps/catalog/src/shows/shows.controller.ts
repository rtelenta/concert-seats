import { Controller, Get, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ShowsService } from './shows.service';
import { SeatDefinitionsService } from '../seat-definitions/seat-definitions.service';
import { ShowResponseDto } from './dto/show-response.dto';
import { ShowStatus } from './show-status.enum';
import { SeatDefinitionResponseDto } from '../seat-definitions/dto/seat-definition-response.dto';

@ApiTags('shows')
@Controller('shows')
export class ShowsController {
  constructor(
    private readonly showsService: ShowsService,
    private readonly seatDefinitionsService: SeatDefinitionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all published shows' })
  async findAll(): Promise<ShowResponseDto[]> {
    const shows = await this.showsService.findAllPublished();
    return shows.map((show) => ShowResponseDto.from(show));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a show by ID' })
  @ApiResponse({ status: 404, description: 'Show not found' })
  async findOne(@Param('id') id: string): Promise<ShowResponseDto> {
    const show = await this.showsService.findOne(id);
    return ShowResponseDto.from(show);
  }

  @Patch(':id/publish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish a draft show' })
  @ApiResponse({ status: 404, description: 'Show not found' })
  @ApiResponse({ status: 422, description: 'Show is not in DRAFT status' })
  async publish(@Param('id') id: string): Promise<ShowResponseDto> {
    const show = await this.showsService.transitionStatus(
      id,
      ShowStatus.PUBLISHED,
    );
    return ShowResponseDto.from(show);
  }

  @Get(':id/seats')
  @ApiOperation({ summary: 'List seat definitions for a show' })
  @ApiResponse({ status: 404, description: 'Show not found' })
  async findSeats(
    @Param('id') id: string,
  ): Promise<SeatDefinitionResponseDto[]> {
    await this.showsService.findOne(id);
    const seats = await this.seatDefinitionsService.findByShowId(id);
    return seats.map((seat) => SeatDefinitionResponseDto.from(seat));
  }
}
