import { IsInt, IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

export class UpdateScheduleDto {
  @IsInt()
  @IsOptional()
  shift_type_id?: number;

  @IsDateString()
  @IsOptional()
  start_datetime?: string;

  @IsDateString()
  @IsOptional()
  end_datetime?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Scheduled', 'Confirmed', 'Cancelled', 'Completed'])
  status?: string;
}
