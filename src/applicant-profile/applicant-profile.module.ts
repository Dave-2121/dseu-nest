import { forwardRef, Module } from '@nestjs/common';
import { ApplicantProfileController } from './applicant-profile.controller';
import { ApplicantProfileService } from './providers/applicant-profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicantProfile } from './entities/applicant-profile.entity';
import { User } from 'src/auth/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Contact } from 'src/contacts/contact.entity';
import { FamilyDetails } from 'src/family-details/family-details.entity';
import { BankAccount } from 'src/bank-details/bank-details.entity';
import { QuotaDetails } from 'src/quota-details/quota-details.entity';
import { OtherDetails } from 'src/other-details/other-details.entity';

@Module({
  controllers: [ApplicantProfileController],
  providers: [ApplicantProfileService],
  imports: [
    TypeOrmModule.forFeature([
      ApplicantProfile,
      User,
      Contact,
      FamilyDetails,
      BankAccount,
      QuotaDetails,
      OtherDetails,
    ]),
    AuthModule,
    forwardRef(() => Contact),
    forwardRef(() => FamilyDetails),
    forwardRef(() => BankAccount),
    forwardRef(() => QuotaDetails),
    forwardRef(() => OtherDetails),
  ],
})
export class ApplicantProfileModule {}
