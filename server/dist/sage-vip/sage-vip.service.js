"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SageVipService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SageVipService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const time_entry_entity_1 = require("../entities/time-entry.entity");
const leave_application_entity_1 = require("../entities/leave-application.entity");
const user_entity_1 = require("../entities/user.entity");
const pay_code_entity_1 = require("../entities/pay-code.entity");
let SageVipService = SageVipService_1 = class SageVipService {
    timeEntryRepo;
    leaveApplicationRepo;
    userRepo;
    payCodeRepo;
    configService;
    logger = new common_1.Logger(SageVipService_1.name);
    baseUrl;
    apiKey;
    username;
    password;
    companyDb;
    constructor(timeEntryRepo, leaveApplicationRepo, userRepo, payCodeRepo, configService) {
        this.timeEntryRepo = timeEntryRepo;
        this.leaveApplicationRepo = leaveApplicationRepo;
        this.userRepo = userRepo;
        this.payCodeRepo = payCodeRepo;
        this.configService = configService;
        this.baseUrl = this.configService.get('SAGE_VIP_BASE_URL') || '';
        this.apiKey = this.configService.get('SAGE_VIP_API_KEY') || '';
        this.username = this.configService.get('SAGE_VIP_USERNAME') || '';
        this.password = this.configService.get('SAGE_VIP_PASSWORD') || '';
        this.companyDb = this.configService.get('SAGE_VIP_COMPANY_DB') || '';
    }
    isConfigured() {
        return !!(this.baseUrl && this.apiKey && this.username && this.password && this.companyDb);
    }
    async testConnection() {
        if (!this.isConfigured()) {
            return {
                success: false,
                message: 'SAGE VIP integration not configured. Please set environment variables: SAGE_VIP_BASE_URL, SAGE_VIP_API_KEY, SAGE_VIP_USERNAME, SAGE_VIP_PASSWORD, SAGE_VIP_COMPANY_DB',
            };
        }
        this.logger.log('Testing SAGE VIP connection...');
        return {
            success: true,
            message: 'SAGE VIP configuration found (connection test stub - implement actual API call)',
            config: {
                baseUrl: this.baseUrl,
                companyDb: this.companyDb,
            },
        };
    }
    async syncEmployees() {
        if (!this.isConfigured()) {
            throw new Error('SAGE VIP not configured');
        }
        this.logger.log('Syncing employees from SAGE VIP...');
        return {
            success: true,
            message: 'Employee sync stub - implement actual SAGE VIP API integration',
            synced: 0,
            errors: [],
        };
    }
    async pushTimesheets(startDate, endDate) {
        if (!this.isConfigured()) {
            throw new Error('SAGE VIP not configured');
        }
        this.logger.log(`Pushing timesheets from ${startDate} to ${endDate}...`);
        const timeEntries = await this.timeEntryRepo.find({
            where: {
                clockInTime: (0, typeorm_2.Between)(startDate, endDate),
                status: 'approved',
            },
            relations: {
                user: true,
                payCode: true,
                absencePayCode: true,
            },
        });
        return {
            success: true,
            message: 'Timesheet push stub - implement actual SAGE VIP API integration',
            entries_processed: timeEntries.length,
            errors: [],
        };
    }
    async transferLeave(startDate, endDate) {
        if (!this.isConfigured()) {
            throw new Error('SAGE VIP not configured');
        }
        this.logger.log(`Transferring leave from ${startDate} to ${endDate}...`);
        const leaveApps = await this.leaveApplicationRepo.find({
            where: {
                startDate: (0, typeorm_2.MoreThanOrEqual)(startDate),
                endDate: (0, typeorm_2.LessThanOrEqual)(endDate),
                status: 'Approved',
            },
            relations: {
                user: true,
                leaveType: true,
            },
        });
        return {
            success: true,
            message: 'Leave transfer stub - implement actual SAGE VIP API integration',
            leave_transferred: leaveApps.length,
            errors: [],
        };
    }
    async getSyncHistory(limit = 20) {
        return {
            success: true,
            history: [],
            message: 'Sync history stub - implement logging to database',
        };
    }
    async getStatus() {
        const configured = this.isConfigured();
        return {
            configured,
            last_sync: null,
            status: configured ? 'ready' : 'not_configured',
            message: configured
                ? 'SAGE VIP integration configured and ready'
                : 'SAGE VIP integration requires configuration',
        };
    }
};
exports.SageVipService = SageVipService;
exports.SageVipService = SageVipService = SageVipService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(time_entry_entity_1.TimeEntry)),
    __param(1, (0, typeorm_1.InjectRepository)(leave_application_entity_1.LeaveApplication)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(pay_code_entity_1.PayCode)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], SageVipService);
//# sourceMappingURL=sage-vip.service.js.map