export declare class CreateLeaveApplicationDto {
    leave_type_id: number;
    start_date: string;
    end_date: string;
    reason?: string;
    is_hourly?: boolean;
    hours_requested?: number;
    user_id?: number;
    auto_approve?: boolean;
}
