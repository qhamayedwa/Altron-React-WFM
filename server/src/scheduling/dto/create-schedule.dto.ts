import { IsInt, IsOptional, IsString, IsNotEmpty, IsArray, IsDateString } from 'class-validator';

export class CreateScheduleDto {
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  user_ids: number[];

  @IsInt()
  @IsOptional()
  shift_type_id?: number;

  @IsDateString()
  @IsNotEmpty()
  start_datetime: string;

  @IsDateString()
  @IsNotEmpty()
  end_datetime: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
