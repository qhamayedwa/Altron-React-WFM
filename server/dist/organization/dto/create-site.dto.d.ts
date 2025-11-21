export declare class CreateSiteDto {
    region_id: number;
    name: string;
    code: string;
    site_type?: string;
    description?: string;
    manager_name?: string;
    email?: string;
    phone?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state_province?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    geo_fence_radius?: number;
    operating_hours_start?: string;
    operating_hours_end?: string;
    timezone?: string;
    allow_remote_work?: boolean;
}
