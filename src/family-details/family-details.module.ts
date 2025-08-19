import { forwardRef, Module } from '@nestjs/common';
import { FamilyDetailsController } from './family-details.controller';
import { FamilyDetailsService } from './providers/family-details.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyDetails } from './family-details.entity';
import { ApplicantProfile } from 'src/applicant-profile/entities/applicant-profile.entity';

@Module({
  controllers: [FamilyDetailsController],
  providers: [FamilyDetailsService],
  imports: [
    TypeOrmModule.forFeature([FamilyDetails, ApplicantProfile]),
    forwardRef(() => ApplicantProfile),
  ],
})
export class FamilyDetailsModule {}
