import { IsString, IsNumber, IsObject, IsOptional, Min, Max, MaxLength, MinLength } from 'class-validator';

export class CreatePayRuleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(1000)
  priority: number;

  @IsObject()
  conditions: Record<string, any>;

  @IsObject()
  actions: Record<string, any>;
}
