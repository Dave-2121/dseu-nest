import { IsEnum, IsOptional, Matches } from 'class-validator';
import { YesNoNA } from 'src/common/enums/yesNoNa.enum';
import { ArmedForcesPriority } from 'src/quota-details/enums/armedForcesPriority.enum';
import { PwdCategory } from 'src/quota-details/enums/pwd-category.enum';

export class SaveQuotaDto {
  @IsOptional() @IsEnum(PwdCategory) pwd_category?: PwdCategory;

  @IsOptional()
  @Matches(/^(?:4\d(?:\.\d{1,2})?|[5-9]\d(?:\.\d{1,2})?|100(?:\.0{1,2})?)$/) // 40–100
  disability_percentage?: string;

  @IsOptional() @IsEnum(YesNoNA) kashmiri_migrant?: YesNoNA;
  @IsOptional() @IsEnum(YesNoNA) pmsss_jk?: YesNoNA;
  @IsOptional()
  @IsEnum(ArmedForcesPriority)
  armed_forces_priority?: ArmedForcesPriority;
  @IsOptional() @IsEnum(YesNoNA) defense_certificate?: YesNoNA;
}
