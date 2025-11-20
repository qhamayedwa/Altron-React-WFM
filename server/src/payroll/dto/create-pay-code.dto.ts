import { IsString, IsBoolean, IsOptional, IsObject, MaxLength, MinLength } from 'class-validator';

export class CreatePayCodeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  code: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description: string;

  @IsBoolean()
  is_absence_code: boolean;

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;
}
