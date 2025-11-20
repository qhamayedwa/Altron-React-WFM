import { IsInt, IsOptional, IsString } from 'class-validator';

export class ApproveTimeEntryDto {
  @IsInt()
  entry_id: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
