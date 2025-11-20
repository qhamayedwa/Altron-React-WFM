import { IsString, IsOptional, IsEmail, IsInt, Length } from 'class-validator';

export class CreateRegionDto {
  @IsInt()
  company_id: number;

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
  @Length(1, 100)
  manager_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  address_line1?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  address_line2?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  state_province?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  postal_code?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  timezone?: string;
}
