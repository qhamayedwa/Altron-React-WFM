import { IsString, IsOptional, IsEmail, IsInt, IsBoolean, IsNumber, Length } from 'class-validator';

export class CreateSiteDto {
  @IsInt()
  region_id: number;

  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(1, 10)
  code: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  site_type?: string;

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

  @IsString()
  @Length(1, 100)
  address_line1: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  address_line2?: string;

  @IsString()
  @Length(1, 50)
  city: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  state_province?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  postal_code?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsInt()
  geo_fence_radius?: number;

  @IsOptional()
  @IsString()
  operating_hours_start?: string;

  @IsOptional()
  @IsString()
  operating_hours_end?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  allow_remote_work?: boolean;
}
