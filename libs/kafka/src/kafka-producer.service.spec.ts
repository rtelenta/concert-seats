import { Test } from '@nestjs/testing';
import { KafkaProducer } from './kafka-producer.service';
import { KAFKA_INSTANCE } from './kafka.types';
import { EventEnvelope } from '@app/contracts';
import { KafkaPropagator } from '@app/telemetry';

const mockSend = jest.fn().mockResolvedValue(undefined);
const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockDisconnect = jest.fn().mockResolvedValue(undefined);

const mockKafka = {
  producer: jest.fn().mockReturnValue({
    connect: mockConnect,
    disconnect: mockDisconnect,
    send: mockSend,
  }),
};

const testEnvelope: EventEnvelope<{ showId: string }> = {
  eventId: 'evt-1',
  eventType: 'show.created',
  occurredAt: '2026-06-22T00:00:00Z',
  correlationId: 'corr-1',
  causationId: 'cause-1',
  version: 1,
  payload: { showId: 'show-123' },
};

describe('KafkaProducer', () => {
  let producer: KafkaProducer;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        KafkaProducer,
        { provide: KAFKA_INSTANCE, useValue: mockKafka },
      ],
    }).compile();

    producer = module.get(KafkaProducer);
    await producer.onApplicationBootstrap();
  });

  it('connects on bootstrap', () => {
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('sends with correct topic, key, and serialised value', async () => {
    await producer.publish('show-events', 'show-123', testEnvelope);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        topic: 'show-events',
        messages: expect.arrayContaining([
          expect.objectContaining({
            key: 'show-123',
            value: JSON.stringify(testEnvelope),
          }),
        ]),
      }),
    );
  });

  it('injects traceparent header when active span exists', async () => {
    const injectSpy = jest
      .spyOn(KafkaPropagator, 'inject')
      .mockImplementation((carrier) => {
        carrier['traceparent'] = '00-abc-def-01';
        return carrier;
      });

    await producer.publish('show-events', 'show-123', testEnvelope);

    expect(injectSpy).toHaveBeenCalled();
    const [call] = mockSend.mock.calls;
    expect(call[0].messages[0].headers).toMatchObject({
      traceparent: '00-abc-def-01',
    });
    injectSpy.mockRestore();
  });

  it('sends even when no active span (inject adds nothing)', async () => {
    jest.spyOn(KafkaPropagator, 'inject').mockImplementation((c) => c);
    await expect(
      producer.publish('show-events', 'show-123', testEnvelope),
    ).resolves.not.toThrow();
  });
});
