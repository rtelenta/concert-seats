import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { ShowResponseDto } from '../dtos/show-response.dto';
import { SeatDefinitionResponseDto } from '../dtos/seat-definition-response.dto';
import { SeatResponseDto } from '../dtos/seat-response.dto';

@Injectable()
export class ShowsQueryService {
  private readonly catalogUrl: string;
  private readonly seatingUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.catalogUrl = this.config.getOrThrow<string>('CATALOG_URL');
    this.seatingUrl = this.config.getOrThrow<string>('SEATING_URL');
  }

  async getShows(): Promise<ShowResponseDto[]> {
    const res = await lastValueFrom(
      this.http.get<ShowResponseDto[]>(`${this.catalogUrl}/shows`),
    );
    return res.data;
  }

  async getShow(id: string): Promise<ShowResponseDto> {
    const res = await lastValueFrom(
      this.http.get<ShowResponseDto>(`${this.catalogUrl}/shows/${id}`),
    );
    return res.data;
  }

  async getSeatDefinitions(
    showId: string,
  ): Promise<SeatDefinitionResponseDto[]> {
    const res = await lastValueFrom(
      this.http.get<SeatDefinitionResponseDto[]>(
        `${this.catalogUrl}/shows/${showId}/seat-definitions`,
      ),
    );
    return res.data;
  }

  async getSeats(showId: string): Promise<SeatResponseDto[]> {
    const res = await lastValueFrom(
      this.http.get<SeatResponseDto[]>(
        `${this.seatingUrl}/shows/${showId}/seats`,
      ),
    );
    return res.data;
  }
}
