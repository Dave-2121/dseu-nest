import { forwardRef, Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './providers/contacts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './contact.entity';
import { ApplicantProfile } from 'src/applicant-profile/entities/applicant-profile.entity';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService],
  imports: [
    TypeOrmModule.forFeature([Contact, ApplicantProfile]),
    forwardRef(() => ApplicantProfile),
  ],
})
export class ContactsModule {}
