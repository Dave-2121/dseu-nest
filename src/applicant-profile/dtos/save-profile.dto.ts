import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  IsObject,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';
import { Category } from '../enums/category.enum';
import { BloodGroup } from '../enums/blood-group.enum';

export class SaveProfileDto {
  @IsOptional() @IsString() full_name?: string;

  // dd-mm-yyyy
  @IsOptional()
  @Matches(/^\d{2}-\d{2}-\d{4}$/)
  dob?: string;

  @IsOptional() @IsEnum(Gender) gender_code?: Gender;
  @IsOptional() @IsEnum(Category) category_code?: Category;

  @IsOptional() @IsString() nationality?: string;
  @IsOptional() @IsString() religion?: string;

  @IsOptional() @IsEnum(BloodGroup) blood_group_code?: BloodGroup;

  @IsOptional()
  @IsObject()
  address?: {
    house_and_floor?: string;
    city_or_village?: string;
    district?: string;
    landmark?: string;
    pincode?: string;
    state?: string;
    type?: 'permanent' | 'current';
  };
}
