import { ApplicantProfile } from 'src/applicant-profile/entities/applicant-profile.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  Check,
  ValueTransformer,
  OneToOne,
} from 'typeorm';

const Trim: ValueTransformer = {
  to: (v?: string) => (typeof v === 'string' ? v.trim() : v),
  from: (v?: string) => v,
};

const Upper: ValueTransformer = {
  to: (v?: string) => (typeof v === 'string' ? v.trim().toUpperCase() : v),
  from: (v?: string) => v,
};

@Entity('bank_accounts')
// @Check(`"ifsc" ~ '^[A-Z]{4}0[A-Z0-9]{6}$'`)
// @Check(`"account_number" ~ '^[0-9]{6,20}$'`)
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ApplicantProfile, (a) => a.bank)
  applicant: ApplicantProfile;

  @Column({ type: 'varchar', length: 100, transformer: Trim })
  accountHolderName: string;

  @Column({ type: 'varchar', length: 100, transformer: Trim })
  bankName: string;

  @Index()
  @Column({ type: 'char', length: 11, transformer: Upper })
  ifsc: string;

  @Index()
  @Column({ type: 'varchar', length: 20, transformer: Trim })
  accountNumber: string;

  @Column({ type: 'varchar', length: 100, transformer: Trim })
  branchName: string;
}
