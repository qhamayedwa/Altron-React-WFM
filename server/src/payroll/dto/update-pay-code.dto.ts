import { IsString, IsBoolean, IsOptional, IsObject, MaxLength, MinLength } from 'class-validator';

export class UpdatePayCodeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;
}
