import { IsString, IsOptional, IsEmail, IsInt, IsNumber, Length, Min } from 'class-validator';

export class CreateDepartmentDto {
  @IsInt()
  site_id: number;

  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(1, 10)
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  cost_center?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  budget_code?: string;

  @IsOptional()
  @IsInt()
  manager_id?: number;

  @IsOptional()
  @IsInt()
  deputy_manager_id?: number;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  extension?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  standard_hours_per_day?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  standard_hours_per_week?: number;
}
