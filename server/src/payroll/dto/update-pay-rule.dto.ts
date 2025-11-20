import { IsString, IsNumber, IsBoolean, IsObject, IsOptional, Min, Max, MaxLength, MinLength } from 'class-validator';

export class UpdatePayRuleDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsObject()
  actions?: Record<string, any>;
}
