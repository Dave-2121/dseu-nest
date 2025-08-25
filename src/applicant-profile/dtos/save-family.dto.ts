import { IsOptional, IsString, IsNumberString, Matches } from 'class-validator';

export class SaveFamilyDto {
  @IsOptional() @IsString() mother_name?: string;
  @IsOptional() @IsString() father_name?: string;
  @IsOptional()
  @IsString()
  @Matches(/^(?:\+91|0)?[6-9]\d{9}$/, {
    message: 'Phone number must be a valid Indian number',
  })
  father_contact?: string;
  @IsOptional() @IsNumberString() annual_income?: string; // numeric-as-string
}
