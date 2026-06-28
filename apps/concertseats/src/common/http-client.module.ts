import { Global, Injectable, Module, OnModuleInit } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { CorrelationIdStorage } from '@app/common';

@Injectable()
class CorrelationIdInterceptorService implements OnModuleInit {
  constructor(private readonly httpService: HttpService) {}

  onModuleInit(): void {
    this.httpService.axiosRef.interceptors.request.use((config) => {
      const correlationId = CorrelationIdStorage.get();
      if (correlationId) {
        config.headers.set('X-Correlation-Id', correlationId);
      }
      return config;
    });
  }
}

@Global()
@Module({
  imports: [HttpModule],
  providers: [CorrelationIdInterceptorService],
  exports: [HttpModule],
})
export class HttpClientModule {}
