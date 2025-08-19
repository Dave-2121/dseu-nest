import { Controller, Get } from '@nestjs/common';
import { ReferenceService } from './reference.service';

@Controller('reference')
export class ReferenceController {
  constructor(private readonly referenceService: ReferenceService) {}

  @Get('config')
  public Config() {
    const config = this.referenceService.getConfig();
    return { config: config };
  }
}
