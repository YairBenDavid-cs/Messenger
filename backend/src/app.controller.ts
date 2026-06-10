import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('ping')
  ping(): { ok: true } {
    return { ok: true };
  }
}
