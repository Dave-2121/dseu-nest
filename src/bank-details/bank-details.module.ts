import { forwardRef, Module } from '@nestjs/common';
import { BankDetailsController } from './bank-details.controller';
import { BankDetailsService } from './providers/bank-details.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccount } from './bank-details.entity';
import { ApplicantProfile } from 'src/applicant-profile/entities/applicant-profile.entity';

@Module({
  controllers: [BankDetailsController],
  providers: [BankDetailsService],
  imports: [
    TypeOrmModule.forFeature([BankAccount, ApplicantProfile]),
    forwardRef(() => ApplicantProfile),
  ],
})
export class BankDetailsModule {}
