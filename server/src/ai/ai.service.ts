import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, IsNull, Not } from 'typeorm';
import { Department } from '../entities/department.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { PayCalculation } from '../entities/pay-calculation.entity';
import { Role } from '../entities/role.entity';
import { Schedule } from '../entities/schedule.entity';
import { ShiftType } from '../entities/shift-type.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import OpenAI from 'openai';
import { AiFallbackService } from './ai-fallback.service';

export interface SchedulingAnalysis {
  success: boolean;
  analysis?: {
    patterns_identified: string[];
    optimization_suggestions: string[];
    coverage_analysis: {
      understaffed_periods: string[];
      overstaffed_periods: string[];
    };
    efficiency_score: number;
    recommendations: string[];
  };
  suggestions?: any;
  data_period?: string;
  total_schedules_analyzed?: number;
  error?: string;
  fallback_available?: boolean;
}

export interface PayrollInsights {
  success: boolean;
  insights?: {
    anomalies_detected: Array<{
      type: string;
      employee_id?: string;
      date?: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    cost_analysis: {
      total_payroll_cost?: string;
      total_hours_worked?: string;
      overtime_percentage: string;
      average_hourly_rate?: string;
      employees_tracked?: string;
    };
    recommendations: string[];
    compliance_notes: string[];
    efficiency_insights: string[];
  };
  period?: string;
  calculations_analyzed?: number;
  time_entries_analyzed?: number;
  error?: string;
  fallback_available?: boolean;
}

export interface AttendanceAnalysis {
  success: boolean;
  analysis?: {
    attendance_trends: {
      punctuality_score: number;
      consistency_score: number;
      average_daily_hours: string;
    };
    patterns_identified: string[];
    risk_indicators: Array<{
      type: string;
      employee_id: string;
      description: string;
      probability: 'low' | 'medium' | 'high';
    }>;
    recommendations: string[];
    productivity_insights: string[];
  };
  insights?: any;
  period?: string;
  period_summary?: string;
  entries_analyzed?: number;
  error?: string;
  fallback_available?: boolean;
}

export interface ScheduleSuggestion {
  success: boolean;
  suggestions?: {
    recommended_schedule: Array<{
      employee_id: string;
      shift_start: string;
      shift_end: string;
      shift_type: string;
      reasoning: string;
    }>;
    coverage_analysis: {
      peak_hours_covered: boolean;
      minimum_staffing_met: boolean;
      optimal_distribution: boolean;
    };
    efficiency_score: number;
    cost_estimate: string;
    notes: string[];
  };
  target_date?: string;
  employees_available?: number;
  error?: string;
}

export interface NaturalQueryResult {
  success: boolean;
  query?: string;
  result?: {
    response: string;
    insights: string[];
    suggested_actions: string[];
    related_data: Record<string, any>;
  };
  error?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;
  private readonly model = 'gpt-4o';
  private readonly isAvailable: boolean;

  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @InjectRepository(LeaveApplication)
    private leaveApplicationRepo: Repository<LeaveApplication>,
    @InjectRepository(PayCalculation)
    private payCalculationRepo: Repository<PayCalculation>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(ShiftType)
    private shiftTypeRepo: Repository<ShiftType>,
    @InjectRepository(TimeEntry)
    private timeEntryRepo: Repository<TimeEntry>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepo: Repository<UserRole>,
    private configService: ConfigService,
    private fallbackService: AiFallbackService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (apiKey) {
      try {
        this.openai = new OpenAI({ apiKey });
        this.isAvailable = true;
        this.logger.log('OpenAI client initialized successfully');
      } catch (error) {
        this.logger.error(`OpenAI client initialization error: ${error}`);
        this.isAvailable = false;
      }
    } else {
      this.logger.warn('OPENAI_API_KEY not configured, using fallback service');
      this.isAvailable = false;
    }
  }

  async analyzeSchedulingPatterns(
    departmentId?: number,
    days: number = 30,
  ): Promise<SchedulingAnalysis> {
    if (!this.isAvailable) {
      return this.fallbackService.analyzeSchedulingPatterns(departmentId, days);
    }

    try {
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);

      const where: any = {
        startTime: Between(startDate, endDate),
      };

      if (departmentId) {
        where.user = {
          departmentId: departmentId,
        };
      }

      const schedules = await this.scheduleRepo.find({
        where,
        relations: {
          user: true,
          shiftType: true,
        },
        order: { startTime: 'ASC' },
      });

      const scheduleData = schedules.slice(0, 50).map((schedule) => {
        const duration =
          schedule.endTime && schedule.startTime
            ? (new Date(schedule.endTime).getTime() -
                new Date(schedule.startTime).getTime()) /
              (1000 * 60 * 60)
            : 0;

        return {
          date: new Date(schedule.startTime).toISOString().split('T')[0],
          day_of_week: new Date(schedule.startTime).getDay(),
          start_time: new Date(schedule.startTime).toTimeString().slice(0, 5),
          end_time: schedule.endTime
            ? new Date(schedule.endTime).toTimeString().slice(0, 5)
            : 'N/A',
          duration_hours: duration,
          shift_type: schedule.shiftType?.name || 'Regular',
          employee_id: schedule.userId,
          status: schedule.status || 'Scheduled',
        };
      });

      const prompt = `
      Analyze the following scheduling data for workforce management insights:
      
      ${JSON.stringify(scheduleData, null, 2)}
      
      Provide insights in JSON format with the following structure:
      {
        "patterns_identified": ["pattern1", "pattern2"],
        "optimization_suggestions": ["suggestion1", "suggestion2"],
        "coverage_analysis": {
          "understaffed_periods": ["time_period"],
          "overstaffed_periods": ["time_period"]
        },
        "efficiency_score": 0-100,
        "recommendations": ["recommendation1", "recommendation2"]
      }
      `;

      const response = await this.openai!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a workforce management expert analyzing scheduling patterns.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');

      return {
        success: true,
        analysis,
        data_period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        total_schedules_analyzed: schedules.length,
      };
    } catch (error: any) {
      this.logger.error(`AI scheduling analysis error: ${error}`);
      const errorMsg = error.message || String(error);

      if (
        errorMsg.toLowerCase().includes('quota') ||
        errorMsg.toLowerCase().includes('insufficient_quota') ||
        errorMsg.includes('429')
      ) {
        this.logger.log(
          'OpenAI quota exceeded, using fallback statistical analysis',
        );
        return this.fallbackService.analyzeSchedulingPatterns(
          departmentId,
          days,
        );
      }

      return {
        success: false,
        error: errorMsg,
        fallback_available: true,
      };
    }
  }

  async generatePayrollInsights(
    payPeriodStart: Date,
    payPeriodEnd: Date,
  ): Promise<PayrollInsights> {
    if (!this.isAvailable) {
      return this.fallbackService.generatePayrollInsights(
        payPeriodStart,
        payPeriodEnd,
      );
    }

    try {
      const [calculations, timeEntries] = await Promise.all([
        this.payCalculationRepo.find({
          where: {
            payPeriodStart: MoreThanOrEqual(payPeriodStart),
            payPeriodEnd: LessThanOrEqual(payPeriodEnd),
          },
        }),
        this.timeEntryRepo.find({
          where: {
            clockInTime: Between(
              payPeriodStart,
              new Date(payPeriodEnd.getTime() + 24 * 60 * 60 * 1000),
            ),
          },
        }),
      ]);

      const payrollData = calculations.map((calc) => ({
        employee_id: calc.userId,
        regular_hours: Number(calc.regularHours),
        overtime_hours: Number(calc.overtimeHours),
        total_hours: Number(calc.totalHours),
      }));

      const timeData = timeEntries
        .filter((entry) => entry.clockOutTime)
        .map((entry) => ({
          employee_id: entry.userId,
          date: new Date(entry.clockInTime).toISOString().split('T')[0],
          total_hours:
            (new Date(entry.clockOutTime!).getTime() -
              new Date(entry.clockInTime).getTime()) /
            (1000 * 60 * 60),
          clock_in: new Date(entry.clockInTime).toTimeString().slice(0, 5),
          clock_out: entry.clockOutTime
            ? new Date(entry.clockOutTime).toTimeString().slice(0, 5)
            : null,
        }));

      const prompt = `
      Analyze this payroll data for anomalies and insights:
      
      Payroll Calculations: ${JSON.stringify(payrollData.slice(0, 20), null, 2)}
      Time Tracking Data: ${JSON.stringify(timeData.slice(0, 30), null, 2)}
      
      Provide analysis in JSON format:
      {
        "anomalies_detected": [
          {
            "type": "anomaly_type",
            "employee_id": "id",
            "description": "description",
            "severity": "low|medium|high"
          }
        ],
        "cost_analysis": {
          "total_payroll_cost": "amount",
          "overtime_percentage": "percentage",
          "average_hourly_rate": "rate"
        },
        "recommendations": ["recommendation1", "recommendation2"],
        "compliance_notes": ["note1", "note2"],
        "efficiency_insights": ["insight1", "insight2"]
      }
      `;

      const response = await this.openai!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a payroll expert analyzing workforce costs and compliance.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const insights = JSON.parse(response.choices[0].message.content || '{}');

      return {
        success: true,
        insights,
        period: `${payPeriodStart.toISOString().split('T')[0]} to ${payPeriodEnd.toISOString().split('T')[0]}`,
        calculations_analyzed: calculations.length,
        time_entries_analyzed: timeEntries.length,
      };
    } catch (error: any) {
      this.logger.error(`AI payroll insights error: ${error}`);
      const errorMsg = error.message || String(error);

      if (
        errorMsg.toLowerCase().includes('quota') ||
        errorMsg.toLowerCase().includes('insufficient_quota') ||
        errorMsg.includes('429')
      ) {
        this.logger.log(
          'OpenAI quota exceeded, using fallback statistical analysis',
        );
        return this.fallbackService.generatePayrollInsights(
          payPeriodStart,
          payPeriodEnd,
        );
      }

      return {
        success: false,
        error: errorMsg,
        fallback_available: true,
      };
    }
  }

  async analyzeAttendancePatterns(
    employeeId?: number,
    days: number = 30,
  ): Promise<AttendanceAnalysis> {
    if (!this.isAvailable) {
      return this.fallbackService.analyzeAttendancePatterns(employeeId, days);
    }

    try {
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);

      const where: any = {
        clockInTime: Between(startDate, endDate),
      };

      if (employeeId) {
        where.userId = employeeId;
      }

      const entries = await this.timeEntryRepo.find({
        where,
        order: { clockInTime: 'ASC' },
      });

      const attendanceData = entries.map((entry) => {
        const clockInDate = new Date(entry.clockInTime);
        const totalHours = entry.clockOutTime
          ? (new Date(entry.clockOutTime).getTime() - clockInDate.getTime()) /
            (1000 * 60 * 60)
          : 0;

        return {
          employee_id: entry.userId,
          date: clockInDate.toISOString().split('T')[0],
          clock_in_time: clockInDate.toTimeString().slice(0, 5),
          clock_out_time: entry.clockOutTime
            ? new Date(entry.clockOutTime).toTimeString().slice(0, 5)
            : 'Still active',
          total_hours: totalHours,
          day_of_week: clockInDate.getDay(),
          is_late: clockInDate.getHours() > 9,
          break_minutes: 0,
        };
      });

      const prompt = `
      Analyze attendance patterns for workforce insights:
      
      ${JSON.stringify(attendanceData.slice(0, 40), null, 2)}
      
      Provide analysis in JSON format:
      {
        "attendance_trends": {
          "punctuality_score": 0-100,
          "consistency_score": 0-100,
          "average_daily_hours": "hours"
        },
        "patterns_identified": ["pattern1", "pattern2"],
        "risk_indicators": [
          {
            "type": "risk_type",
            "employee_id": "id",
            "description": "description",
            "probability": "low|medium|high"
          }
        ],
        "recommendations": ["recommendation1", "recommendation2"],
        "productivity_insights": ["insight1", "insight2"]
      }
      `;

      const response = await this.openai!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an HR analytics expert analyzing employee attendance patterns.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');

      return {
        success: true,
        analysis,
        period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        entries_analyzed: entries.length,
      };
    } catch (error: any) {
      this.logger.error(`AI attendance analysis error: ${error}`);
      const errorMsg = error.message || String(error);

      if (
        errorMsg.toLowerCase().includes('quota') ||
        errorMsg.toLowerCase().includes('insufficient_quota') ||
        errorMsg.includes('429')
      ) {
        this.logger.log(
          'OpenAI quota exceeded, using fallback statistical analysis',
        );
        return this.fallbackService.analyzeAttendancePatterns(employeeId, days);
      }

      return {
        success: false,
        error: errorMsg,
        fallback_available: true,
      };
    }
  }

  async suggestOptimalSchedule(
    targetDate: Date,
    departmentId?: number,
  ): Promise<ScheduleSuggestion> {
    if (!this.isAvailable) {
      return {
        success: false,
        error: 'OpenAI service not available for schedule optimization',
      };
    }

    try {
      const dayOfWeek = targetDate.getDay();

      const historicalSchedules = await this.scheduleRepo.find({
        where: {
          startTime: MoreThanOrEqual(
            new Date(targetDate.getTime() - 60 * 24 * 60 * 60 * 1000),
          ),
        },
        relations: {
          shiftType: true,
        },
        take: 50,
      });

      const employeesQuery: any = { isActive: true };
      if (departmentId) {
        employeesQuery.departmentId = departmentId;
      }

      const employees = await this.userRepo.find({
        where: employeesQuery,
        relations: {
          userRoles: {
            role: true,
          },
        },
      });

      const historicalData = historicalSchedules.map((schedule) => ({
        date: new Date(schedule.startTime).toISOString().split('T')[0],
        employee_id: schedule.userId,
        start_time: new Date(schedule.startTime).toTimeString().slice(0, 5),
        end_time: schedule.endTime
          ? new Date(schedule.endTime).toTimeString().slice(0, 5)
          : 'N/A',
        shift_type: schedule.shiftType?.name || 'Regular',
      }));

      const employeeData = employees.map((emp) => ({
        id: emp.id,
        role:
          emp.userRoles.length > 0
            ? emp.userRoles[0].role.name
            : 'Employee',
        department: emp.departmentId || 'General',
      }));

      const prompt = `
      Generate an optimal schedule for ${targetDate.toISOString().split('T')[0]} (${targetDate.toLocaleDateString('en-US', { weekday: 'long' })}):
      
      Historical same-day schedules: ${JSON.stringify(historicalData.slice(0, 20), null, 2)}
      Available employees: ${JSON.stringify(employeeData, null, 2)}
      
      Provide optimized schedule in JSON format:
      {
        "recommended_schedule": [
          {
            "employee_id": "id",
            "shift_start": "HH:MM",
            "shift_end": "HH:MM",
            "shift_type": "Regular|Overtime|Night",
            "reasoning": "why this assignment"
          }
        ],
        "coverage_analysis": {
          "peak_hours_covered": true/false,
          "minimum_staffing_met": true/false,
          "optimal_distribution": true/false
        },
        "efficiency_score": 0-100,
        "cost_estimate": "estimated_cost",
        "notes": ["note1", "note2"]
      }
      `;

      const response = await this.openai!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a workforce optimization expert creating efficient schedules.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const suggestions = JSON.parse(
        response.choices[0].message.content || '{}',
      );

      return {
        success: true,
        suggestions,
        target_date: targetDate.toISOString().split('T')[0],
        employees_available: employees.length,
      };
    } catch (error: any) {
      this.logger.error(`AI schedule optimization error: ${error}`);
      return {
        success: false,
        error: error.message || String(error),
      };
    }
  }

  async naturalLanguageQuery(query: string): Promise<NaturalQueryResult> {
    if (!this.isAvailable) {
      return {
        success: false,
        error: 'OpenAI service not available for natural language queries',
      };
    }

    try {
      const [totalEmployees, recentEntries, recentSchedules, pendingLeave] =
        await Promise.all([
          this.userRepo.count({ where: { isActive: true } }),
          this.timeEntryRepo.count({
            where: {
              clockInTime: MoreThanOrEqual(
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              ),
            },
          }),
          this.scheduleRepo.count({
            where: {
              startTime: MoreThanOrEqual(
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              ),
            },
          }),
          this.leaveApplicationRepo.count({
            where: { status: 'Pending' },
          }),
        ]);

      const context = `
      Current WFM System Status:
      - Total Active Employees: ${totalEmployees}
      - Time Entries (Last 7 days): ${recentEntries}
      - Schedules (Last 7 days): ${recentSchedules}
      - Pending Leave Applications: ${pendingLeave}
      - Current Date: ${new Date().toISOString().split('T')[0]}
      `;

      const prompt = `
      ${context}
      
      User Query: "${query}"
      
      Provide a helpful response about the workforce management system in JSON format:
      {
        "response": "direct answer to the query",
        "insights": ["relevant insight1", "relevant insight2"],
        "suggested_actions": ["action1", "action2"],
        "related_data": {
          "metric1": "value1",
          "metric2": "value2"
        }
      }
      `;

      const response = await this.openai!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful WFM assistant providing insights about workforce data.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        success: true,
        query,
        result,
      };
    } catch (error: any) {
      this.logger.error(`AI natural language query error: ${error}`);
      return {
        success: false,
        error: error.message || String(error),
      };
    }
  }
}
