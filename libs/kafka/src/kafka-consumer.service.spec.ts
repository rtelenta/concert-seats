import { Test } from '@nestjs/testing';
import { KafkaConsumer } from './kafka-consumer.service';
import { KAFKA_INSTANCE, KAFKA_OPTIONS, SubscribeOptions } from './kafka.types';
import { EventEnvelope } from '@app/contracts';
import { z } from 'zod';

type EachMessageHandler = (ctx: {
  topic: string;
  partition: number;
  message: {
    key: Buffer | null;
    value: Buffer | null;
    offset: string;
    headers: Record<string, Buffer | string>;
  };
}) => Promise<void>;

let capturedEachMessage: EachMessageHandler;

const mockCommitOffsets = jest.fn().mockResolvedValue(undefined);
const mockConsumerConnect = jest.fn().mockResolvedValue(undefined);
const mockConsumerDisconnect = jest.fn().mockResolvedValue(undefined);
const mockSubscribe = jest.fn().mockResolvedValue(undefined);
const mockRun = jest
  .fn()
  .mockImplementation(
    ({ eachMessage }: { eachMessage: EachMessageHandler }) => {
      capturedEachMessage = eachMessage;
      return Promise.resolve();
    },
  );

const mockDlqSend = jest.fn().mockResolvedValue(undefined);
const mockDlqConnect = jest.fn().mockResolvedValue(undefined);

const mockKafka = {
  consumer: jest.fn().mockReturnValue({
    connect: mockConsumerConnect,
    disconnect: mockConsumerDisconnect,
    subscribe: mockSubscribe,
    run: mockRun,
    commitOffsets: mockCommitOffsets,
  }),
  producer: jest.fn().mockReturnValue({
    connect: mockDlqConnect,
    disconnect: jest.fn().mockResolvedValue(undefined),
    send: mockDlqSend,
  }),
};

const validEnvelope: EventEnvelope = {
  eventId: 'evt-abc',
  eventType: 'show.created',
  occurredAt: '2026-06-22T00:00:00Z',
  correlationId: 'corr-1',
  causationId: 'cause-1',
  version: 1,
  payload: {},
};

function makeMessage(value: string | null) {
  return {
    topic: 'show-events',
    partition: 0,
    message: {
      key: Buffer.from('show-123'),
      value: value !== null ? Buffer.from(value) : null,
      offset: '5',
      headers: {},
    },
  };
}

async function buildConsumerAndSubscribe(opts?: Partial<SubscribeOptions>) {
  const module = await Test.createTestingModule({
    providers: [
      KafkaConsumer,
      { provide: KAFKA_INSTANCE, useValue: mockKafka },
      { provide: KAFKA_OPTIONS, useValue: { groupId: 'test-group' } },
    ],
  }).compile();

  const consumer = module.get(KafkaConsumer);
  const baseOpts: SubscribeOptions = {
    topics: ['show-events'],
    handler: jest.fn().mockResolvedValue(undefined),
    isProcessed: jest.fn().mockResolvedValue(false),
    markProcessed: jest.fn().mockResolvedValue(undefined),
    ...opts,
  };
  await consumer.subscribe(baseOpts);
  return { consumer, ...baseOpts };
}

describe('KafkaConsumer', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('valid message', () => {
    it('calls handler and commits offset', async () => {
      const { handler, isProcessed, markProcessed } =
        await buildConsumerAndSubscribe();
      (isProcessed as jest.Mock).mockResolvedValue(false);

      await capturedEachMessage(makeMessage(JSON.stringify(validEnvelope)));

      expect(handler).toHaveBeenCalledWith(validEnvelope, expect.anything());
      expect(markProcessed).toHaveBeenCalledWith(validEnvelope.eventId);
      expect(mockCommitOffsets).toHaveBeenCalledWith([
        { topic: 'show-events', partition: 0, offset: '6' },
      ]);
    });
  });

  describe('invalid JSON', () => {
    it('routes to DLQ and commits offset without calling handler', async () => {
      const { handler } = await buildConsumerAndSubscribe();

      await capturedEachMessage(makeMessage('not-valid-json'));

      expect(handler).not.toHaveBeenCalled();
      expect(mockDlqSend).toHaveBeenCalledWith(
        expect.objectContaining({ topic: 'show-events.dlq' }),
      );
      expect(mockCommitOffsets).toHaveBeenCalled();
    });
  });

  describe('Zod validation failure', () => {
    it('routes to DLQ when schema rejects the message', async () => {
      const strictSchema = z.object({ notPresent: z.string() });
      const { handler } = await buildConsumerAndSubscribe({
        schemaResolver: () => strictSchema,
      });

      await capturedEachMessage(makeMessage(JSON.stringify(validEnvelope)));

      expect(handler).not.toHaveBeenCalled();
      expect(mockDlqSend).toHaveBeenCalledWith(
        expect.objectContaining({ topic: 'show-events.dlq' }),
      );
    });
  });

  describe('duplicate eventId', () => {
    it('skips handler and commits offset', async () => {
      const { handler, isProcessed } = await buildConsumerAndSubscribe();
      (isProcessed as jest.Mock).mockResolvedValue(true);

      await capturedEachMessage(makeMessage(JSON.stringify(validEnvelope)));

      expect(handler).not.toHaveBeenCalled();
      expect(mockCommitOffsets).toHaveBeenCalledWith([
        { topic: 'show-events', partition: 0, offset: '6' },
      ]);
    });
  });

  describe('handler throws', () => {
    it('does not commit offset', async () => {
      await buildConsumerAndSubscribe({
        handler: jest.fn().mockRejectedValue(new Error('boom')),
        isProcessed: jest.fn().mockResolvedValue(false),
      });

      await capturedEachMessage(makeMessage(JSON.stringify(validEnvelope)));

      expect(mockCommitOffsets).not.toHaveBeenCalled();
    });
  });
});
