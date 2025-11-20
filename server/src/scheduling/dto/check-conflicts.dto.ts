import { IsInt, IsDateString, IsOptional } from 'class-validator';

export class CheckConflictsDto {
  @IsInt()
  user_id: number;

  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;

  @IsInt()
  @IsOptional()
  exclude_schedule_id?: number;
}
