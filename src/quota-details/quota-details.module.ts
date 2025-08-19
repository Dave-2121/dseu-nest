import { forwardRef, Module } from '@nestjs/common';
import { QuotaDetailsController } from './quota-details.controller';
import { QuotaDetailsService } from './providers/quota-details.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotaDetails } from './quota-details.entity';
import { ApplicantProfile } from 'src/applicant-profile/entities/applicant-profile.entity';
import { FamilyDetails } from 'src/family-details/family-details.entity';

@Module({
  controllers: [QuotaDetailsController],
  providers: [QuotaDetailsService],
  imports: [
    TypeOrmModule.forFeature([QuotaDetails, ApplicantProfile]),
    forwardRef(() => FamilyDetails),
  ],
})
export class QuotaDetailsModule {}
