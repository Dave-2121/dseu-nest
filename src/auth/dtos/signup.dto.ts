import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  name: string;
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?:\+91|0)?[6-9]\d{9}$/, {
    message: 'Phone number must be a valid Indian number',
  })
  mobileNo: string;

  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @MinLength(6)
  @IsNotEmpty()
  confirmPassword: string;
}
