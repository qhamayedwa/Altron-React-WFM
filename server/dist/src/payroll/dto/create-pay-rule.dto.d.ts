export declare class CreatePayRuleDto {
    name: string;
    description?: string;
    priority: number;
    conditions: Record<string, any>;
    actions: Record<string, any>;
}
