import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { CurrentUser } from '../../guards/current-user.decorator';
import type { ClerkJwtPayload } from '../../guards/clerk-auth.guard';
import { HoldSeatsDto } from '../dtos/hold-seats.dto';
import { ShowsQueryService } from '../services/shows-query.service';
import { ShowResponseDto } from '../dtos/show-response.dto';
import { SeatDefinitionResponseDto } from '../dtos/seat-definition-response.dto';
import { SeatResponseDto } from '../dtos/seat-response.dto';

@ApiTags('shows')
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

  @Post(':id/seats/hold')
  @HttpCode(200)
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Hold seats for a show (authenticated)' })
  @ApiResponse({ status: 200, description: 'Seats held successfully' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'One or more seats not found' })
  @ApiResponse({ status: 409, description: 'One or more seats unavailable' })
  holdSeats(
    @Param('id') id: string,
    @Body() dto: HoldSeatsDto,
    @CurrentUser() user: ClerkJwtPayload,
  ): Promise<SeatResponseDto[]> {
    return this.showsQueryService.holdSeats(id, dto, user.sub);
  }
}
