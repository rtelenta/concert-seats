import { SeatDefinition } from '../seat-definition.entity';

export class SeatDefinitionResponseDto {
  id: string;
  showId: string;
  section: string;
  row: string;
  number: number;
  price: number;
  createdAt: Date;

  static from(seat: SeatDefinition): SeatDefinitionResponseDto {
    const dto = new SeatDefinitionResponseDto();
    dto.id = seat.id;
    dto.showId = seat.showId;
    dto.section = seat.section;
    dto.row = seat.row;
    dto.number = seat.number;
    dto.price = Number(seat.price);
    dto.createdAt = seat.createdAt;
    return dto;
  }
}
