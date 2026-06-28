import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CorrelationIdStorage } from '@app/common';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = req.headers['x-correlation-id'] as string | undefined;
    if (correlationId) {
      CorrelationIdStorage.run(correlationId, () => next());
    } else {
      next();
    }
  }
}
