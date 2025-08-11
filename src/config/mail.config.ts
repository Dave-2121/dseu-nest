import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailConfigService {
  constructor(private configService: ConfigService) {}

  get mailUser(): string {
    return (
      this.configService.get<string>('MAIL_USER') || 'dsms.devsharma@gmail.com'
    );
  }

  get mailPass(): string {
    return this.configService.get<string>('MAIL_PASS') || '123456';
  }
}
