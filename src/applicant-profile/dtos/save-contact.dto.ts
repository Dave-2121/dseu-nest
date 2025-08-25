import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class SaveContactDto {
  @IsOptional() @IsEmail() alternate_email?: string;
  @IsOptional()
  @IsString()
  @Matches(/^(?:\+91|0)?[6-9]\d{9}$/, {
    message: 'Phone number must be a valid Indian number',
  })
  alternate_phone?: string;
}
