import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect('health')
  root() {}

  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
