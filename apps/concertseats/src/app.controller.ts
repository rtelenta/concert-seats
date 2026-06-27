import { Controller, Get, Redirect, UseGuards } from '@nestjs/common';
import {
  ClerkAuthGuard,
  type ClerkJwtPayload,
} from './guards/clerk-auth.guard';
import { CurrentUser } from './guards/current-user.decorator';

@Controller()
export class AppController {
  @Get()
  @Redirect('health')
  root() {}

  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  me(@CurrentUser() user: ClerkJwtPayload): { userId: string } {
    return { userId: user.sub };
  }
}
