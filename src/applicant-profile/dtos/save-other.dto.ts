import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { YesNoNA } from 'src/common/enums/yesNoNa.enum';

export class SaveOtherDto {
  @IsOptional() @IsEnum(YesNoNA) has_illness?: YesNoNA;
  @IsOptional() @IsString() illness_nature?: string;

  @IsOptional() @IsEnum(YesNoNA) has_ncc?: YesNoNA;
  @IsOptional() @IsString() ncc_type?: string;

  @IsOptional() @IsEnum(YesNoNA) has_nss?: YesNoNA;
  @IsOptional() @IsInt() @Min(0) nss_hours?: number;

  @IsOptional() @IsEnum(YesNoNA) is_ward_employee?: YesNoNA;
  @IsOptional() @IsString() dept_name?: string;
  @IsOptional() @IsString() designation_name?: string;
  @IsOptional() @IsString() employee_id?: string;
  @IsOptional() @IsString() employee_mobile?: string;
}
