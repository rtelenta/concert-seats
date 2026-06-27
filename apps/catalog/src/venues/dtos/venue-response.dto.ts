import { Venue } from '../entities/venue.entity';

export class VenueResponseDto {
  id: string;
  name: string;
  city: string;
  capacity: number;

  static from(venue: Venue): VenueResponseDto {
    const dto = new VenueResponseDto();
    dto.id = venue.id;
    dto.name = venue.name;
    dto.city = venue.city;
    dto.capacity = venue.capacity;
    return dto;
  }
}
