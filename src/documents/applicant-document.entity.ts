import { ApplicantProfile } from 'src/applicant-profile/entities/applicant-profile.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { DocumentStatus, DocumentType } from './enums/enums';
// import { ApplicantProfile } from '@/applications/entities/applicant-profile.entity';
// import { DocumentStatus, DocumentType } from '../enums';

@Entity('applicant_documents')
@Index(['applicant_id', 'doc_type', 'version'], { unique: true })
@Index(['applicant_id', 'doc_type', 'deleted_at'])
export class ApplicantDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  applicant_id: string;

  @ManyToOne(() => ApplicantProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicant_id' })
  applicant: ApplicantProfile;

  @Column({ type: 'enum', enum: DocumentType })
  doc_type: DocumentType;

  @Column('int', { default: 1 })
  version: number;

  // storage
  @Column('text')
  s3_key: string;

  @Column('text')
  cdn_url: string;

  // file meta
  @Column('text')
  original_filename: string;

  @Column('text')
  ext: string; // .jpeg / .png / .pdf

  @Column('text')
  mime_type: string; // image/jpeg / application/pdf

  @Column('bigint')
  size_bytes: string; // store as string to avoid JS bigint issues

  // review
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column('text', { nullable: true })
  rejection_reason?: string;

  // soft delete per version
  @DeleteDateColumn()
  deleted_at?: Date | null;

  @CreateDateColumn()
  uploaded_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
