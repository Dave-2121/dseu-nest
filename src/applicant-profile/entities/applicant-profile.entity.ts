import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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

@Entity('applicant_profiles')
export class ApplicantProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  user: User;

  @Column({ type: 'varchar', length: 96 }) full_name: string;

  @Column({ type: 'date' }) dob: Date;

  @Column({ type: 'enum', enum: Gender, nullable: false })
  gender_code: Gender;

  @Column({ type: 'enum', enum: Category, nullable: false })
  category_code: Category;

  @Column({ type: 'enum', enum: BloodGroup, nullable: false })
  blood_group_code: BloodGroup;

  @Column({ type: 'varchar', length: 20 }) nationality: string;

  @Column({ type: 'varchar', length: 20 }) religion: string;

  @Column({ type: 'jsonb', nullable: false })
  address: {
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
  })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @OneToOne(() => FamilyDetails, (f) => f.applicant, {
    cascade: true,
    eager: false,
  })
  @JoinColumn({ name: 'family_id' })
  family: FamilyDetails;

  @OneToOne(() => BankAccount, (b) => b.applicant, {
    cascade: true,
    eager: false,
  })
  @JoinColumn({ name: 'bank_id' })
  bank: BankAccount;

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

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
