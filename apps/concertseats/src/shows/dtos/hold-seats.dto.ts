import { ApiProperty } from '@nestjs/swagger';

export class HoldSeatsDto {
  @ApiProperty({ type: [String] })
  seatIds: string[];
}
