import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClerkAuthGuard } from './clerk-auth.guard';

@Module({
  providers: [ClerkAuthGuard],
  exports: [ClerkAuthGuard],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const key = this.config.get<string>('CLERK_SECRET_KEY');
    if (!key) {
      throw new Error(
        'CLERK_SECRET_KEY is not set. The concertseats service cannot start without it.',
      );
    }
  }
}
