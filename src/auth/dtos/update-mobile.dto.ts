import { IsNotEmpty, Matches } from 'class-validator';

export class UpdateMobileDto {
  @IsNotEmpty()
  @Matches(/^(?:\+91|0)?[6-9]\d{9}$/, {
    message: 'Phone number must be a valid Indian number',
  })
  mobileNo: string;
}
