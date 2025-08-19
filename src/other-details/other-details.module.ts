import { forwardRef, Module } from '@nestjs/common';
import { OtherDetailsController } from './other-details.controller';
import { OtherDetailsService } from './providers/other-details.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtherDetails } from './other-details.entity';
import { ApplicantProfile } from 'src/applicant-profile/entities/applicant-profile.entity';

@Module({
  controllers: [OtherDetailsController],
  providers: [OtherDetailsService],
  imports: [
    TypeOrmModule.forFeature([OtherDetails, ApplicantProfile]),
    forwardRef(() => ApplicantProfile),
  ],
})
export class OtherDetailsModule {}
