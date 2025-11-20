import { IsString, IsOptional, IsEmail, IsInt, IsUrl, Length, Min, Max } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(1, 10)
  code: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  legal_name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  registration_number?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  tax_number?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

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
  country?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  timezone?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  fiscal_year_start?: number;
}
