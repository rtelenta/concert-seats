import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Show } from './show.entity';
import { ShowStatus } from './show-status.enum';

const ALLOWED_TRANSITIONS: Record<ShowStatus, ShowStatus[]> = {
  [ShowStatus.DRAFT]: [ShowStatus.PUBLISHED, ShowStatus.CANCELLED],
  [ShowStatus.PUBLISHED]: [],
  [ShowStatus.CANCELLED]: [],
};

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
  ) {}

  async transitionStatus(showId: string, newStatus: ShowStatus): Promise<Show> {
    const show = await this.showRepository.findOne({ where: { id: showId } });
    if (!show) {
      throw new NotFoundException(`Show ${showId} not found`);
    }

    const allowed = ALLOWED_TRANSITIONS[show.status];
    if (!allowed.includes(newStatus)) {
      throw new UnprocessableEntityException(
        `Cannot transition show from ${show.status} to ${newStatus}`,
      );
    }

    show.status = newStatus;
    return this.showRepository.save(show);
  }
}
