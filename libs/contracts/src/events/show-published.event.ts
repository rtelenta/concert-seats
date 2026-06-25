export interface ShowPublishedPayload {
  showId: string;
  title: string;
  artist: string;
  dateTime: string;
  venueId: string;
}

export const SHOW_PUBLISHED = 'ShowPublished';
export const SHOW_EVENTS_TOPIC = 'show-events';
