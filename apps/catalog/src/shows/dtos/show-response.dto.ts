import { Show } from '../entities/show.entity';

export class ShowResponseDto {
  id: string;
  title: string;
  artist: string;
  dateTime: Date;
  status: string;
  venueId: string;
  createdAt: Date;
  updatedAt: Date;

  static from(show: Show): ShowResponseDto {
    const dto = new ShowResponseDto();
    dto.id = show.id;
    dto.title = show.title;
    dto.artist = show.artist;
    dto.dateTime = show.dateTime;
    dto.status = show.status;
    dto.venueId = show.venueId;
    dto.createdAt = show.createdAt;
    dto.updatedAt = show.updatedAt;
    return dto;
  }
}
