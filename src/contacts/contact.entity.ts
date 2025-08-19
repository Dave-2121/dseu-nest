import { ApplicantProfile } from 'src/applicant-profile/entities/applicant-profile.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ApplicantProfile, (a) => a.contact)
  applicant: ApplicantProfile;

  @Column({ type: 'text', nullable: true }) alternate_email?: string;
  @Column({ type: 'text', nullable: true }) alternate_phone?: string;
}
