import { IsOptional, IsString } from 'class-validator';

export class UpdateLeaveApplicationDto {
  @IsOptional()
  @IsString()
  manager_comments?: string;
}
