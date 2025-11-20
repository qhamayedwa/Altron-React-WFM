import { IsString, IsOptional, IsBoolean, Matches } from 'class-validator';

export class UpdateShiftTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'default_start_time must be in HH:MM format' })
  default_start_time?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'default_end_time must be in HH:MM format' })
  default_end_time?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
