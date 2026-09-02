import { Controller, Get } from '@nestjs/common';

/** Unauthenticated liveness check for the hosting platform's health probe. */
@Controller()
export class AppController {
  @Get('health')
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
