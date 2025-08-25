import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/auth/entities/user.entity';

import { Gender } from '../enums/gender.enum';
import { Category } from '../enums/category.enum';
import { BloodGroup } from '../enums/blood-group.enum';
import { Contact } from 'src/contacts/contact.entity';
import { FamilyDetails } from 'src/family-details/family-details.entity';
import { BankAccount } from 'src/bank-details/bank-details.entity';
import { QuotaDetails } from 'src/quota-details/quota-details.entity';
import { OtherDetails } from 'src/other-details/other-details.entity';
import { ApplicationStatus } from 'src/common/enums/applicationStatus.enum';
import { ApplicantDocument } from 'src/documents/applicant-document.entity';

@Entity('applicant_profiles')
export class ApplicantProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  user_id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 96, nullable: true }) full_name?: string;

  @Column({ type: 'date', nullable: true }) dob?: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender_code?: Gender;

  @Column({ type: 'enum', enum: Category, nullable: true })
  category_code?: Category;

  @Column({ type: 'enum', enum: BloodGroup, nullable: true })
  blood_group_code?: BloodGroup;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.DRAFT,
  })
  application_status: ApplicationStatus;

  @Column({ type: 'boolean', default: false }) documents_locked: boolean;
  @Column({ type: 'timestamptz', nullable: true }) documents_deadline?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true }) nationality?: string;

  @Column({ type: 'varchar', length: 20, nullable: true }) religion?: string;

  @Column({ type: 'jsonb', nullable: true })
  address?: {
    house_and_floor: string;
    city_or_village: string;
    district: string;
    landmark?: string;
    pincode: string;
    state: string;
    type?: 'permanent' | 'current';
  };

  @OneToOne(() => Contact, (c) => c.applicant, {
    cascade: true,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'contact_id' })
  contact?: Contact;

  @OneToOne(() => FamilyDetails, (f) => f.applicant, {
    cascade: true,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'family_id' })
  family?: FamilyDetails;

  @OneToOne(() => BankAccount, (b) => b.applicant, {
    cascade: true,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'bank_id' })
  bank?: BankAccount;

  @OneToOne(() => QuotaDetails, (q) => q.applicant, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'quota_id' })
  quota?: QuotaDetails;

  @OneToOne(() => OtherDetails, (o) => o.applicant, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'other_id' })
  other?: OtherDetails;

  @OneToMany(() => ApplicantDocument, (d) => d.applicant)
  documents?: ApplicantDocument[];

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
