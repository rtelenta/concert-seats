import { DynamicModule, Module, OnApplicationShutdown } from '@nestjs/common';
import { TraceService } from './trace.service';
import { TelemetryOptions } from './telemetry.options';
import { getBootstrappedSdk } from './bootstrap';
import { TELEMETRY_OPTIONS } from './telemetry.constants';

export { TELEMETRY_OPTIONS } from './telemetry.constants';

@Module({})
export class TelemetryModule implements OnApplicationShutdown {
  static forRoot(options: TelemetryOptions): DynamicModule {
    return {
      module: TelemetryModule,
      global: true,
      providers: [
        { provide: TELEMETRY_OPTIONS, useValue: options },
        TraceService,
      ],
      exports: [TraceService],
    };
  }

  async onApplicationShutdown(): Promise<void> {
    const sdk = getBootstrappedSdk();
    if (sdk) {
      await sdk.shutdown();
    }
  }
}
