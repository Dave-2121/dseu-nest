// src/documents/documents.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, Equal } from 'typeorm';
import { extname } from 'path';

import { S3Service } from './s3.service';
import { ApplicantDocument } from '../applicant-document.entity';
import { DocumentType } from '../enums/enums';
import { ApplicantProfile } from 'src/applicant-profile/entities/applicant-profile.entity';

const ALLOWED: Record<
  DocumentType,
  { ext: string[]; mime: string[]; max: number }
> = {
  PHOTO: {
    ext: ['.jpeg', '.jpg', '.png'],
    mime: ['image/jpeg', 'image/png'],
    max: 3 * 1024 * 1024,
  },
  SIGNATURE: {
    ext: ['.jpeg', '.jpg', '.png'],
    mime: ['image/jpeg', 'image/png'],
    max: 2 * 1024 * 1024,
  },
  PMSSS_CERT: {
    ext: ['.pdf', '.jpeg', '.jpg', '.png'],
    mime: ['application/pdf', 'image/jpeg', 'image/png'],
    max: 10 * 1024 * 1024,
  },
  KASHMIRI_CERT: {
    ext: ['.pdf', '.jpeg', '.jpg', '.png'],
    mime: ['application/pdf', 'image/jpeg', 'image/png'],
    max: 10 * 1024 * 1024,
  },
  PWBD_CERT: {
    ext: ['.pdf', '.jpeg', '.jpg', '.png'],
    mime: ['application/pdf', 'image/jpeg', 'image/png'],
    max: 10 * 1024 * 1024,
  },
  DEFENCE_CERT: {
    ext: ['.pdf', '.jpeg', '.jpg', '.png'],
    mime: ['application/pdf', 'image/jpeg', 'image/png'],
    max: 10 * 1024 * 1024,
  },
};

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(ApplicantDocument)
    private readonly docRepo: Repository<ApplicantDocument>,
    @InjectRepository(ApplicantProfile)
    private readonly profiles: Repository<ApplicantProfile>,
    private readonly s3: S3Service,
  ) {}

  /** Resolve FK target: applicant_profiles.id for this user */
  private async getProfileIdForUser(userId: string): Promise<string> {
    try {
      const p = await this.profiles.findOne({ where: { user_id: userId } });
      if (!p) throw new NotFoundException('Create applicant profile first');
      return p.id;
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to resolve applicant profile',
      );
    }
  }

  // --- helpers --------------------------------------------------------------

  private normalizeExt(name: string) {
    const e = (extname(name) || '').toLowerCase();
    return e === '.jpg' ? '.jpeg' : e;
  }

  private validate(
    type: DocumentType,
    original: string,
    mime: string,
    size: number,
  ) {
    const rule = ALLOWED[type];
    if (!rule) throw new BadRequestException('Unsupported document type');

    const ext = this.normalizeExt(original);
    if (!rule.ext.includes(ext)) {
      throw new BadRequestException(`Extension ${ext} not allowed for ${type}`);
    }
    if (!rule.mime.includes(mime)) {
      throw new BadRequestException(`MIME ${mime} not allowed for ${type}`);
    }
    if (size > rule.max) {
      throw new BadRequestException(`File too large (max ${rule.max} bytes)`);
    }
    return ext;
  }

  private async nextVersion(applicantProfileId: string, type: DocumentType) {
    try {
      const latest = await this.docRepo.findOne({
        where: {
          applicant_id: applicantProfileId,
          doc_type: Equal(type),
          deleted_at: IsNull(),
        },
        order: { version: 'DESC' },
      });
      return (latest?.version ?? 0) + 1;
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to determine next document version',
      );
    }
  }

  private key(profileId: string, type: DocumentType, v: number, ext: string) {
    return `applicants/${profileId}/${type}/v${v}${ext}`;
  }

  // --- public API -----------------------------------------------------------

  async upload(userId: string, type: DocumentType, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');

    const profileId = await this.getProfileIdForUser(userId);

    const ext = this.validate(
      type,
      file.originalname,
      file.mimetype,
      file.size,
    );
    const version = await this.nextVersion(profileId, type);
    const key = this.key(profileId, type, version, ext);

    try {
      await this.s3.uploadBuffer(key, file.buffer, file.mimetype, file.size);
      const saved = await this.docRepo.save(
        this.docRepo.create({
          applicant_id: profileId,
          doc_type: type,
          version,
          s3_key: key,
          cdn_url: this.s3.toCdnUrl(key),
          original_filename: file.originalname,
          ext,
          mime_type: file.mimetype,
          size_bytes: String(file.size),
        }),
      );
      return {
        doc_id: saved.id,
        version: saved.version,
        cdn_url: saved.cdn_url,
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to upload document');
    }
  }

  async replace(userId: string, type: DocumentType, file: Express.Multer.File) {
    const profileId = await this.getProfileIdForUser(userId);

    const res = await this.upload(userId, type, file);

    try {
      const prevLatest = await this.docRepo.findOne({
        where: {
          applicant_id: profileId,
          doc_type: Equal(type),
          deleted_at: IsNull(),
          version: Not(res.version),
        },
        order: { version: 'DESC' },
      });

      if (prevLatest) {
        await this.docRepo.softDelete({ id: prevLatest.id });
        await this.s3.deleteObject(prevLatest.s3_key);
      }
    } catch (err) {
      throw new InternalServerErrorException('Failed to replace document');
    }

    return res;
  }

  async list(userId: string) {
    const profileId = await this.getProfileIdForUser(userId);
    try {
      return await this.docRepo.find({
        where: { applicant_id: profileId, deleted_at: IsNull() },
        order: { doc_type: 'ASC', version: 'DESC' },
      });
    } catch (err) {
      throw new InternalServerErrorException('Failed to list documents');
    }
  }

  async latestByType(userId: string, type: DocumentType) {
    const profileId = await this.getProfileIdForUser(userId);
    try {
      const latest = await this.docRepo.findOne({
        where: {
          applicant_id: profileId,
          doc_type: Equal(type),
          deleted_at: IsNull(),
        },
        order: { version: 'DESC' },
      });
      if (!latest) throw new NotFoundException('No document found');
      return latest;
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch latest document');
    }
  }

  async deleteById(userId: string, docId: string) {
    const profileId = await this.getProfileIdForUser(userId);
    try {
      const doc = await this.docRepo.findOne({
        where: { id: docId, applicant_id: profileId, deleted_at: IsNull() },
      });
      if (!doc) throw new NotFoundException('Document not found');

      await this.docRepo.softDelete({ id: docId });
      await this.s3.deleteObject(doc.s3_key);

      return { ok: true };
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete document');
    }
  }
}
