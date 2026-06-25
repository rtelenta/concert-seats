import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { KafkaProducer } from '@app/kafka';
import {
  SHOW_EVENTS_TOPIC,
  SHOW_PUBLISHED,
  ShowPublishedPayload,
} from '@app/contracts';
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
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  findAllPublished(): Promise<Show[]> {
    return this.showRepository.find({
      where: { status: ShowStatus.PUBLISHED },
      order: { dateTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Show> {
    const show = await this.showRepository.findOne({ where: { id } });
    if (!show) {
      throw new NotFoundException(`Show ${id} not found`);
    }
    return show;
  }

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
    const saved = await this.showRepository.save(show);

    if (newStatus === ShowStatus.PUBLISHED) {
      await this.kafkaProducer.publish<ShowPublishedPayload>(
        SHOW_EVENTS_TOPIC,
        saved.id,
        {
          eventId: randomUUID(),
          eventType: SHOW_PUBLISHED,
          occurredAt: new Date().toISOString(),
          correlationId: randomUUID(),
          causationId: randomUUID(),
          version: 1,
          payload: {
            showId: saved.id,
            title: saved.title,
            artist: saved.artist,
            dateTime: saved.dateTime.toISOString(),
            venueId: saved.venueId,
          },
        },
      );
    }

    return saved;
  }
}
