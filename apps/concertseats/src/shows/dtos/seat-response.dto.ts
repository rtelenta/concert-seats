export class SeatResponseDto {
  seatId: string;
  showId: string;
  seatDefinitionId: string;
  section: string;
  row: string;
  number: number;
  price: number;
  status: string;
  heldBy: string | null;
  heldUntil: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
