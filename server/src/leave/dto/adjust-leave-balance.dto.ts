import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AdjustLeaveBalanceDto {
  @IsNumber()
  new_balance: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
