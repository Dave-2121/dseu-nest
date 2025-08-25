import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicantProfile } from '../entities/applicant-profile.entity';
import { Contact } from 'src/contacts/contact.entity';
import { FamilyDetails } from 'src/family-details/family-details.entity';
import { QuotaDetails } from 'src/quota-details/quota-details.entity';
import { OtherDetails } from 'src/other-details/other-details.entity';
import { ApplicationStatus } from 'src/common/enums/applicationStatus.enum';
import { SaveProfileDto } from '../dtos/save-profile.dto';
import { SaveContactDto } from '../dtos/save-contact.dto';
import { SaveFamilyDto } from '../dtos/save-family.dto';
import { SaveQuotaDto } from '../dtos/save-quota.dto';
import { PwdCategory } from 'src/quota-details/enums/pwd-category.enum';
import { YesNoNA } from 'src/common/enums/yesNoNa.enum';
import { SaveOtherDto } from '../dtos/save-other.dto';
import { User } from 'src/auth/entities/user.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class ApplicantProfileService {
  constructor(
    @InjectRepository(ApplicantProfile)
    private readonly profileRepo: Repository<ApplicantProfile>,
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    @InjectRepository(FamilyDetails)
    private readonly familyRepo: Repository<FamilyDetails>,
    @InjectRepository(QuotaDetails)
    private readonly quotaRepo: Repository<QuotaDetails>,
    @InjectRepository(OtherDetails)
    private readonly otherRepo: Repository<OtherDetails>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  private requireUserId(userId?: string) {
    if (!userId) throw new UnauthorizedException('Missing authenticated user');
    return userId;
  }

  private async ensureProfile(userId: string): Promise<ApplicantProfile> {
    userId = this.requireUserId(userId);

    const exists = await this.users.exists({ where: { id: userId } });
    if (!exists) throw new NotFoundException('User not found');

    let p = await this.profileRepo.findOne({
      where: { user_id: userId },
      relations: ['contact', 'family', 'quota', 'other'],
    });
    if (!p) {
      try {
        p = this.profileRepo.create({
          user_id: userId,
          application_status: ApplicationStatus.DRAFT,
        });
        p = await this.profileRepo.save(p);
      } catch (err) {
        throw new InternalServerErrorException('Failed to create profile');
      }
    }
    return p;
  }

  private parseDobMaybe(dob?: string): Date | undefined {
    if (!dob) return undefined;
    const [dd, mm, yyyy] = dob.split('-').map(Number);
    const d = new Date(Date.UTC(yyyy, mm - 1, dd));
    if (isNaN(d.getTime())) throw new BadRequestException('Invalid DOB');
    return d;
  }

  async saveProfile(userId: string, dto: SaveProfileDto) {
    userId = this.requireUserId(userId);
    await this.ensureProfile(userId);

    const patch: QueryDeepPartialEntity<ApplicantProfile> = { ...(dto as any) };
    if (dto.dob) (patch as any).dob = this.parseDobMaybe(dto.dob);

    try {
      await this.profileRepo.update({ user_id: userId } as any, patch);
    } catch (err) {
      throw new InternalServerErrorException('Failed to save profile');
    }
    return { ok: true };
  }

  async saveContact(userId: string, dto: SaveContactDto) {
    userId = this.requireUserId(userId);
    const profile = await this.ensureProfile(userId);

    try {
      if (profile.contact) {
        const updated = await this.contactRepo.preload({
          id: profile.contact.id,
          ...dto,
        });
        if (!updated) throw new NotFoundException('Contact not found');
        await this.contactRepo.save(updated);
      } else {
        const contact = this.contactRepo.create(dto);
        const savedContact = await this.contactRepo.save(contact);
        profile.contact = savedContact;
        await this.profileRepo.save(profile);
      }
    } catch (err) {
      throw new InternalServerErrorException('Failed to save contact');
    }
    return { ok: true };
  }

  async saveFamily(userId: string, dto: SaveFamilyDto) {
    userId = this.requireUserId(userId);
    const profile = await this.ensureProfile(userId);

    try {
      if (profile.family) {
        const updated = await this.familyRepo.preload({
          id: profile.family.id,
          ...dto,
        });
        if (!updated) throw new NotFoundException('Family not found');
        await this.familyRepo.save(updated);
      } else {
        const family = this.familyRepo.create(dto);
        const saved = await this.familyRepo.save(family);
        profile.family = saved;
        await this.profileRepo.save(profile);
      }
    } catch (err) {
      throw new InternalServerErrorException('Failed to save family details');
    }
    return { ok: true };
  }

  async saveQuota(userId: string, dto: SaveQuotaDto) {
    userId = this.requireUserId(userId);
    const profile = await this.ensureProfile(userId);

    try {
      if (profile.quota) {
        const updated = await this.quotaRepo.preload({
          id: profile.quota.id,
          ...dto,
        });
        if (!updated) throw new NotFoundException('Quota not found');
        await this.quotaRepo.save(updated);
      } else {
        const quota = this.quotaRepo.create({
          pwd_category: PwdCategory.NA,
          kashmiri_migrant: YesNoNA.NA,
          pmsss_jk: YesNoNA.NA,
          armed_forces_priority: null,
          defense_certificate: YesNoNA.NO,
          ...dto,
        });
        const savedQuota = await this.quotaRepo.save(quota);
        profile.quota = savedQuota;
        await this.profileRepo.save(profile);
      }
    } catch (err) {
      throw new InternalServerErrorException('Failed to save quota details');
    }
    return { ok: true };
  }

  async saveOther(userId: string, dto: SaveOtherDto) {
    userId = this.requireUserId(userId);
    const profile = await this.ensureProfile(userId);

    try {
      if (profile.other) {
        const updated = await this.otherRepo.preload({
          id: profile.other.id,
          ...dto,
        });
        if (!updated) throw new NotFoundException('Other details not found');
        await this.otherRepo.save(updated);
      } else {
        const other = this.otherRepo.create(dto);
        const savedOther = await this.otherRepo.save(other);
        profile.other = savedOther;
        await this.profileRepo.save(profile);
      }
    } catch (err) {
      throw new InternalServerErrorException('Failed to save other details');
    }
    return { ok: true };
  }

  async getMe(userId: string) {
    userId = this.requireUserId(userId);
    try {
      return await this.profileRepo.findOne({
        where: { user_id: userId },
        relations: ['contact', 'family', 'quota', 'other', 'user', 'documents'],
      });
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch profile');
    }
  }

  async progress(userId: string) {
    userId = this.requireUserId(userId);
    const p = await this.getMe(userId);
    if (!p) return { percent: 0, missing: [] as string[] };
    const missing: string[] = [];
    return { percent: 10, missing };
  }

  async submit(userId: string) {
    userId = this.requireUserId(userId);
    const p = await this.getMe(userId);
    if (!p) throw new BadRequestException('Create profile first');

    try {
      await this.profileRepo.update(
        { user_id: userId },
        { application_status: ApplicationStatus.SUBMITTED },
      );
    } catch (err) {
      throw new InternalServerErrorException('Failed to submit application');
    }
    return { ok: true, status: ApplicationStatus.SUBMITTED };
  }
}
