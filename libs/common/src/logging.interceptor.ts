import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { CorrelationIdStorage } from './correlation-id.storage';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const { method, path } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const correlationId = CorrelationIdStorage.get();
        const ms = Date.now() - start;
        this.logger.log(
          `[${correlationId}] ${method} ${path} → ${res.statusCode} ${ms}ms`,
        );
      }),
    );
  }
}
