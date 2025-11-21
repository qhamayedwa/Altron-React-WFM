import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry } from '../entities/time-entry.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class SageVipService {
  private readonly logger = new Logger(SageVipService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly username: string;
  private readonly password: string;
  private readonly companyDb: string;

  constructor(
    @InjectRepository(TimeEntry)
    private timeEntryRepo: Repository<TimeEntry>,
    @InjectRepository(LeaveApplication)
    private leaveApplicationRepo: Repository<LeaveApplication>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get('SAGE_VIP_BASE_URL') || '';
    this.apiKey = this.configService.get('SAGE_VIP_API_KEY') || '';
    this.username = this.configService.get('SAGE_VIP_USERNAME') || '';
    this.password = this.configService.get('SAGE_VIP_PASSWORD') || '';
    this.companyDb = this.configService.get('SAGE_VIP_COMPANY_DB') || '';
  }

  isConfigured(): boolean {
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

  async pushTimesheets(startDate: Date, endDate: Date) {
    if (!this.isConfigured()) {
      throw new Error('SAGE VIP not configured');
    }

    this.logger.log(`Pushing timesheets from ${startDate} to ${endDate}...`);

    const timeEntries = await this.timeEntryRepo.find({
      where: {
        clock_in_time: {
          gte: startDate,
          lte: endDate,
        },
        status: 'approved',
      },
      relations: {
        users_time_entries_user_idTousers: true,
      },
    });

    return {
      success: true,
      message: 'Timesheet push stub - implement actual SAGE VIP API integration',
      entries_processed: timeEntries.length,
      errors: [],
    };
  }

  async transferLeave(startDate: Date, endDate: Date) {
    if (!this.isConfigured()) {
      throw new Error('SAGE VIP not configured');
    }

    this.logger.log(`Transferring leave from ${startDate} to ${endDate}...`);

    const leaveApps = await this.leaveApplicationRepo.find({
      where: {
        start_date: {
          gte: startDate,
        },
        end_date: {
          lte: endDate,
        },
        status: 'Approved',
      },
      relations: {
        users_leave_applications_user_idTousers: true,
        leave_types: true,
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
}
