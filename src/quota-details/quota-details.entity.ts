// src/applicants/entities/quota-details.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  Check,
} from 'typeorm';
import { PwdCategory } from './enums/pwd-category.enum';
import { YesNoNA } from '../common/enums/yesNoNa.enum';
import { ArmedForcesPriority } from './enums/armedForcesPriority.enum';
import { ApplicantProfile } from 'src/applicant-profile/entities/applicant-profile.entity';

@Entity('quota_details')
@Check(
  `(pwd_category = 'NA' AND disability_percentage IS NULL) OR (pwd_category <> 'NA' AND disability_percentage BETWEEN 40 AND 100)`,
)
export class QuotaDetails {
  @PrimaryGeneratedColumn('uuid') id: string;

  @OneToOne(() => ApplicantProfile, (a) => a.quota) applicant: ApplicantProfile;

  // 23. Person with Disability
  @Column({ type: 'enum', enum: PwdCategory, default: PwdCategory.NA })
  pwd_category: PwdCategory;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  disability_percentage?: string;

  // 24. Kashmiri Migrant
  @Column({ type: 'enum', enum: YesNoNA, default: YesNoNA.NA })
  kashmiri_migrant: YesNoNA;

  // 25. PMSSS for J&K
  @Column({ type: 'enum', enum: YesNoNA, default: YesNoNA.NA })
  pmsss_jk: YesNoNA;

  // 26. Children/Widows of Armed Forces Personnel (Priority)
  @Column({
    type: 'enum',
    enum: ArmedForcesPriority,
    default: ArmedForcesPriority.NA,
  })
  armed_forces_priority: ArmedForcesPriority;

  // 27. Defense Personnel Certificate
  @Column({ type: 'enum', enum: YesNoNA, default: YesNoNA.NO })
  defense_certificate: YesNoNA;
}
