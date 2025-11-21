import { IsInt, IsDateString, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateManualEntryDto {
  @IsInt()
  user_id: number;

  @IsDateString()
  clock_in_time: string;

  @IsDateString()
  clock_out_time: string;

  @IsOptional()
  @IsNumber()
  break_time?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
