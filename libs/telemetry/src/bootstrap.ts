import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { TelemetryOptions } from './telemetry.options';

let sdk: NodeSDK | undefined;

export function bootstrapTelemetry(options: TelemetryOptions): NodeSDK {
  if (options.enabled === false) {
    return undefined as unknown as NodeSDK;
  }

  const endpoint =
    options.endpoint ??
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
    'http://localhost:4317';

  const exporter = new OTLPTraceExporter({ url: endpoint });

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: options.serviceName,
      [ATTR_SERVICE_VERSION]:
        options.serviceVersion ?? process.env.npm_package_version ?? 'unknown',
      'deployment.environment':
        options.environment ?? process.env.NODE_ENV ?? 'development',
    }),
    spanProcessors: [new BatchSpanProcessor(exporter)],
    instrumentations: [new HttpInstrumentation(), new NestInstrumentation()],
    textMapPropagator: new W3CTraceContextPropagator(),
  });

  sdk.start();
  return sdk;
}

export function getBootstrappedSdk(): NodeSDK | undefined {
  return sdk;
}
