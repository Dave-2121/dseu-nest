// src/applicants/entities/other-details.entity.ts
import { ApplicantProfile } from 'src/applicant-profile/entities/applicant-profile.entity';
import { YesNoNA } from 'src/common/enums/yesNoNa.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  Check,
} from 'typeorm';
// import { ApplicantProfile } from './applicant-profile.entity';
// import { NccType, YesNoNA } from '../enums';

@Entity('other_details')
@Check(
  `(has_illness = 'NO' AND illness_nature IS NULL) OR (has_illness = 'YES' AND illness_nature IS NOT NULL)`,
)
@Check(
  `(has_ncc = 'NO' AND ncc_type IS NULL) OR (has_ncc = 'YES' AND ncc_type IS NOT NULL)`,
)
@Check(
  `(has_nss = 'NO' AND nss_hours IS NULL) OR (has_nss = 'YES' AND nss_hours IS NOT NULL AND nss_hours >= 0)`,
)
@Check(
  `(is_ward_employee = 'NO' AND dept_name IS NULL AND designation_name IS NULL AND employee_id IS NULL AND employee_mobile IS NULL) OR (is_ward_employee = 'YES')`,
)
export class OtherDetails {
  @PrimaryGeneratedColumn('uuid') id: string;

  @OneToOne(() => ApplicantProfile, (a) => a.other) applicant: ApplicantProfile;

  // 28. Illness needing attention
  @Column({ type: 'enum', enum: YesNoNA, default: YesNoNA.NO })
  has_illness: YesNoNA;
  @Column({ type: 'text', nullable: true }) illness_nature?: string;

  // 29. NCC Certificate
  @Column({ type: 'enum', enum: YesNoNA, default: YesNoNA.NO })
  has_ncc: YesNoNA;
  @Column({ type: 'text', nullable: true }) ncc_type?: string;

  // 30. NSS participation
  @Column({ type: 'enum', enum: YesNoNA, default: YesNoNA.NO })
  has_nss: YesNoNA;
  @Column({ type: 'integer', nullable: true }) nss_hours?: number;

  // 31. Ward of University Employee (DSEU)
  @Column({ type: 'enum', enum: YesNoNA, default: YesNoNA.NO })
  is_ward_employee: YesNoNA;

  @Column({ type: 'text', nullable: true }) dept_name?: string;
  @Column({ type: 'text', nullable: true }) designation_name?: string;
  @Column({ type: 'text', nullable: true }) employee_id?: string;
  @Column({ type: 'text', nullable: true }) employee_mobile?: string;
}
