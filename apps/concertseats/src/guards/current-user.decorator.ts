import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { ClerkJwtPayload } from './clerk-auth.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ClerkJwtPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { auth: ClerkJwtPayload }>();
    return request.auth;
  },
);
