import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { VenueResponseDto } from '../dtos/venue-response.dto';

@Injectable()
export class VenuesQueryService {
  private readonly catalogUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.catalogUrl = this.config.getOrThrow<string>('CATALOG_URL');
  }

  async getVenues(): Promise<VenueResponseDto[]> {
    const res = await lastValueFrom(
      this.http.get<VenueResponseDto[]>(`${this.catalogUrl}/venues`),
    );
    return res.data;
  }

  async getVenue(id: string): Promise<VenueResponseDto> {
    const res = await lastValueFrom(
      this.http.get<VenueResponseDto>(`${this.catalogUrl}/venues/${id}`),
    );
    return res.data;
  }
}
