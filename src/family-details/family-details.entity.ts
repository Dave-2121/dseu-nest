import { ApplicantProfile } from 'src/applicant-profile/entities/applicant-profile.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

@Entity('family_details')
export class FamilyDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ApplicantProfile, (a) => a.family)
  applicant: ApplicantProfile;

  @Column({ type: 'text' }) mother_name: string;

  @Column({ type: 'text' }) father_name: string;

  @Column({ unique: true, type: 'varchar', length: 16 })
  father_contact: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  annual_income: string;
}
