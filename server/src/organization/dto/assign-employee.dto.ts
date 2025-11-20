import { IsInt } from 'class-validator';

export class AssignEmployeeDto {
  @IsInt()
  employee_id: number;

  @IsInt()
  department_id: number;
}
