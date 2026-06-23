import { Inject, Injectable } from '@nestjs/common';
import {
  trace,
  context,
  Span,
  SpanOptions,
  SpanStatusCode,
  Tracer,
  INVALID_SPAN_CONTEXT,
} from '@opentelemetry/api';
import { TelemetryOptions } from './telemetry.options';
import { TELEMETRY_OPTIONS } from './telemetry.constants';

@Injectable()
export class TraceService {
  private readonly tracer: Tracer;

  constructor(
    @Inject(TELEMETRY_OPTIONS) private readonly options: TelemetryOptions,
  ) {
    this.tracer = trace.getTracer(options.serviceName);
  }

  startSpan(name: string, opts?: SpanOptions): Span {
    return this.tracer.startSpan(name, opts, context.active());
  }

  withSpan<T>(
    name: string,
    fn: (span: Span) => T | Promise<T>,
    opts?: SpanOptions,
  ): Promise<T> {
    return this.tracer.startActiveSpan(name, opts ?? {}, async (span: Span) => {
      try {
        const result = await fn(span);
        span.end();
        return result;
      } catch (err) {
        span.recordException(err as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.end();
        throw err;
      }
    });
  }

  currentSpan(): Span {
    const span = trace.getActiveSpan();
    if (!span) {
      return trace.wrapSpanContext(INVALID_SPAN_CONTEXT);
    }
    return span;
  }
}
