import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicantProfileService } from './providers/applicant-profile.service';
import { SaveProfileDto } from './dtos/save-profile.dto';
import { SaveContactDto } from './dtos/save-contact.dto';
import { SaveFamilyDto } from './dtos/save-family.dto';
import { SaveOtherDto } from './dtos/save-other.dto';
import { SaveQuotaDto } from './dtos/save-quota.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token/access-token.guard';

@Controller('applicant-profile')
@UseGuards(AccessTokenGuard)
export class ApplicantProfileController {
  constructor(private readonly svc: ApplicantProfileService) {}
  @Get('me')
  @UseGuards(AccessTokenGuard)
  me(@Req() req: any) {
    return this.svc.getMe(req.user.sub);
  }

  // Partial saves — each section/table
  @Patch('profile')
  @UseGuards(AccessTokenGuard)
  saveProfile(
    @Req() req: any,
    @Body()
    dto: SaveProfileDto,
  ) {
    return this.svc.saveProfile(req.user.sub, dto);
  }

  @Patch('contact')
  saveContact(
    @Req() req: any,
    @Body()
    dto: SaveContactDto,
  ) {
    return this.svc.saveContact(req.user.sub, dto);
  }

  @Patch('family')
  saveFamily(
    @Req() req: any,
    @Body()
    dto: SaveFamilyDto,
  ) {
    return this.svc.saveFamily(req.user.sub, dto);
  }

  @Patch('quota')
  saveQuota(
    @Req() req: any,
    @Body()
    dto: SaveQuotaDto,
  ) {
    return this.svc.saveQuota(req.user.sub, dto);
  }

  @Patch('other')
  saveOther(
    @Req() req: any,
    @Body()
    dto: SaveOtherDto,
  ) {
    return this.svc.saveOther(req.user.sub, dto);
  }

  // Completion and final submit
  @Get('me/progress')
  progress(@Req() req: any) {
    return this.svc.progress(req.user.sub);
  }

  @Post('submit')
  submit(@Req() req: any) {
    return this.svc.submit(req.user.sub);
  }
}
