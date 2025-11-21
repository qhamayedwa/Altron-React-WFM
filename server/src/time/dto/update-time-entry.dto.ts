import { IsDateString, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateTimeEntryDto {
  @IsOptional()
  @IsDateString()
  clock_in_time?: string;

  @IsOptional()
  @IsDateString()
  clock_out_time?: string;

  @IsOptional()
  @IsNumber()
  break_time?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
