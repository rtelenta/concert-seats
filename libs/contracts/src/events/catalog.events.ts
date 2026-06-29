import { EventEnvelope } from '../envelope';

export const SHOW_PUBLISHED = 'ShowPublished';
export const SHOW_EVENTS_TOPIC = 'show-events';

export interface ShowPublishedSeat {
  seatDefinitionId: string;
  section: string;
  row: string;
  number: number;
  price: number;
}

export interface ShowPublishedPayload {
  showId: string;
  title: string;
  artist: string;
  dateTime: string;
  venueId: string;
  seats: ShowPublishedSeat[];
}

export type ShowPublished = EventEnvelope<
  'ShowPublished',
  ShowPublishedPayload
>;
