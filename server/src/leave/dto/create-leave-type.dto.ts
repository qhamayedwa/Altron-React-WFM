import { IsString, IsOptional, IsBoolean, IsNumber, IsInt, Min } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  default_accrual_rate?: number;

  @IsOptional()
  @IsBoolean()
  requires_approval?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_consecutive_days?: number;
}
