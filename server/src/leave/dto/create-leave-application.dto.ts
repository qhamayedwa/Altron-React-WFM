import { IsInt, IsString, IsOptional, IsBoolean, IsDateString, Min } from 'class-validator';

export class CreateLeaveApplicationDto {
  @IsInt()
  leave_type_id: number;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  is_hourly?: boolean;

  @IsOptional()
  @Min(0)
  hours_requested?: number;

  @IsOptional()
  @IsInt()
  user_id?: number;

  @IsOptional()
  @IsBoolean()
  auto_approve?: boolean;
}
