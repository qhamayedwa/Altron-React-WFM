import { IsDateString, IsOptional, IsArray, IsBoolean, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculatePayrollDto {
  @IsDateString()
  pay_period_start: string;

  @IsDateString()
  pay_period_end: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  employee_ids?: number[];

  @IsOptional()
  @IsBoolean()
  save_results?: boolean;
}
