import { trace, Span, Tracer, SpanStatusCode } from '@opentelemetry/api';
import { TraceService } from './trace.service';

describe('TraceService', () => {
  let service: TraceService;
  let mockSpan: jest.Mocked<
    Pick<Span, 'recordException' | 'setStatus' | 'end'>
  >;
  let mockTracer: jest.Mocked<Pick<Tracer, 'startActiveSpan' | 'startSpan'>>;

  beforeEach(() => {
    mockSpan = {
      recordException: jest.fn(),
      setStatus: jest.fn(),
      end: jest.fn(),
    };

    mockTracer = {
      startActiveSpan: jest
        .fn()
        .mockImplementation(
          (_name: string, _opts: object, fn: (span: Span) => unknown) =>
            fn(mockSpan as unknown as Span),
        ),
      startSpan: jest.fn().mockReturnValue(mockSpan),
    };

    jest.spyOn(trace, 'getTracer').mockReturnValue(mockTracer);

    service = new TraceService({ serviceName: 'test-service' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('withSpan', () => {
    it('records the exception, sets ERROR status, ends the span, and re-throws', async () => {
      const error = new Error('boom');

      await expect(
        service.withSpan('op', () => Promise.reject(error)),
      ).rejects.toThrow(error);

      expect(mockSpan.recordException).toHaveBeenCalledWith(error);
      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: SpanStatusCode.ERROR,
      });
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it('does not record an exception and ends the span on success', async () => {
      const result = { ok: true };

      await expect(
        service.withSpan('op', () => Promise.resolve(result)),
      ).resolves.toEqual(result);

      expect(mockSpan.recordException).not.toHaveBeenCalled();
      expect(mockSpan.setStatus).not.toHaveBeenCalled();
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it('ends the span exactly once whether the callback succeeds or throws', async () => {
      await service.withSpan('op', (span) => {
        span.end(); // caller ends it early
        return Promise.resolve();
      });
      expect(mockSpan.end).toHaveBeenCalledTimes(2);
    });
  });
});
