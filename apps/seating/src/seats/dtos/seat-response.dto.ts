import { SeatStatus } from '../entities/seat-status.enum';
import { Seat } from '../entities/seat.entity';

export class SeatResponseDto {
  seatId: string;
  showId: string;
  seatDefinitionId: string;
  section: string;
  row: string;
  number: number;
  price: number;
  status: SeatStatus;
  heldBy: string | null;
  heldUntil: Date | null;
  version: number;
  createdAt: Date;

  static from(seat: Seat): SeatResponseDto {
    const dto = new SeatResponseDto();
    dto.seatId = seat.seatId;
    dto.showId = seat.showId;
    dto.seatDefinitionId = seat.seatDefinitionId;
    dto.section = seat.section;
    dto.row = seat.row;
    dto.number = seat.number;
    dto.price = Number(seat.price);
    dto.status = seat.status;
    dto.heldBy = seat.heldBy;
    dto.heldUntil = seat.heldUntil;
    dto.version = seat.version;
    dto.createdAt = seat.createdAt;
    return dto;
  }
}
