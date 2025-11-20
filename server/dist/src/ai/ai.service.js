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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const openai_1 = __importDefault(require("openai"));
const ai_fallback_service_1 = require("./ai-fallback.service");
let AiService = AiService_1 = class AiService {
    prisma;
    configService;
    fallbackService;
    logger = new common_1.Logger(AiService_1.name);
    openai = null;
    model = 'gpt-4o';
    isAvailable;
    constructor(prisma, configService, fallbackService) {
        this.prisma = prisma;
        this.configService = configService;
        this.fallbackService = fallbackService;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (apiKey) {
            try {
                this.openai = new openai_1.default({ apiKey });
                this.isAvailable = true;
                this.logger.log('OpenAI client initialized successfully');
            }
            catch (error) {
                this.logger.error(`OpenAI client initialization error: ${error}`);
                this.isAvailable = false;
            }
        }
        else {
            this.logger.warn('OPENAI_API_KEY not configured, using fallback service');
            this.isAvailable = false;
        }
    }
    async analyzeSchedulingPatterns(departmentId, days = 30) {
        if (!this.isAvailable) {
            return this.fallbackService.analyzeSchedulingPatterns(departmentId, days);
        }
        try {
            const endDate = new Date();
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - days);
            const where = {
                start_time: {
                    gte: startDate,
                    lte: endDate,
                },
            };
            if (departmentId) {
                where.users_schedules_user_idTousers = {
                    department_id: departmentId,
                };
            }
            const schedules = await this.prisma.schedules.findMany({
                where,
                include: {
                    users_schedules_user_idTousers: true,
                    shift_types: true,
                },
                orderBy: { start_time: 'asc' },
            });
            const scheduleData = schedules.slice(0, 50).map((schedule) => {
                const duration = schedule.end_time && schedule.start_time
                    ? (new Date(schedule.end_time).getTime() -
                        new Date(schedule.start_time).getTime()) /
                        (1000 * 60 * 60)
                    : 0;
                return {
                    date: new Date(schedule.start_time).toISOString().split('T')[0],
                    day_of_week: new Date(schedule.start_time).getDay(),
                    start_time: new Date(schedule.start_time).toTimeString().slice(0, 5),
                    end_time: schedule.end_time
                        ? new Date(schedule.end_time).toTimeString().slice(0, 5)
                        : 'N/A',
                    duration_hours: duration,
                    shift_type: schedule.shift_types?.name || 'Regular',
                    employee_id: schedule.user_id,
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
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a workforce management expert analyzing scheduling patterns.',
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
        }
        catch (error) {
            this.logger.error(`AI scheduling analysis error: ${error}`);
            const errorMsg = error.message || String(error);
            if (errorMsg.toLowerCase().includes('quota') ||
                errorMsg.toLowerCase().includes('insufficient_quota') ||
                errorMsg.includes('429')) {
                this.logger.log('OpenAI quota exceeded, using fallback statistical analysis');
                return this.fallbackService.analyzeSchedulingPatterns(departmentId, days);
            }
            return {
                success: false,
                error: errorMsg,
                fallback_available: true,
            };
        }
    }
    async generatePayrollInsights(payPeriodStart, payPeriodEnd) {
        if (!this.isAvailable) {
            return this.fallbackService.generatePayrollInsights(payPeriodStart, payPeriodEnd);
        }
        try {
            const [calculations, timeEntries] = await Promise.all([
                this.prisma.pay_calculations.findMany({
                    where: {
                        pay_period_start: { gte: payPeriodStart },
                        pay_period_end: { lte: payPeriodEnd },
                    },
                }),
                this.prisma.time_entries.findMany({
                    where: {
                        clock_in_time: {
                            gte: payPeriodStart,
                            lte: new Date(payPeriodEnd.getTime() + 24 * 60 * 60 * 1000),
                        },
                    },
                }),
            ]);
            const payrollData = calculations.map((calc) => ({
                employee_id: calc.user_id,
                regular_hours: Number(calc.regular_hours),
                overtime_hours: Number(calc.overtime_hours),
                total_hours: Number(calc.total_hours),
            }));
            const timeData = timeEntries
                .filter((entry) => entry.clock_out_time)
                .map((entry) => ({
                employee_id: entry.user_id,
                date: new Date(entry.clock_in_time).toISOString().split('T')[0],
                total_hours: (new Date(entry.clock_out_time).getTime() -
                    new Date(entry.clock_in_time).getTime()) /
                    (1000 * 60 * 60),
                clock_in: new Date(entry.clock_in_time).toTimeString().slice(0, 5),
                clock_out: entry.clock_out_time
                    ? new Date(entry.clock_out_time).toTimeString().slice(0, 5)
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
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a payroll expert analyzing workforce costs and compliance.',
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
        }
        catch (error) {
            this.logger.error(`AI payroll insights error: ${error}`);
            const errorMsg = error.message || String(error);
            if (errorMsg.toLowerCase().includes('quota') ||
                errorMsg.toLowerCase().includes('insufficient_quota') ||
                errorMsg.includes('429')) {
                this.logger.log('OpenAI quota exceeded, using fallback statistical analysis');
                return this.fallbackService.generatePayrollInsights(payPeriodStart, payPeriodEnd);
            }
            return {
                success: false,
                error: errorMsg,
                fallback_available: true,
            };
        }
    }
    async analyzeAttendancePatterns(employeeId, days = 30) {
        if (!this.isAvailable) {
            return this.fallbackService.analyzeAttendancePatterns(employeeId, days);
        }
        try {
            const endDate = new Date();
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - days);
            const where = {
                clock_in_time: {
                    gte: startDate,
                    lte: endDate,
                },
            };
            if (employeeId) {
                where.user_id = employeeId;
            }
            const entries = await this.prisma.time_entries.findMany({
                where,
                orderBy: { clock_in_time: 'asc' },
            });
            const attendanceData = entries.map((entry) => {
                const clockInDate = new Date(entry.clock_in_time);
                const totalHours = entry.clock_out_time
                    ? (new Date(entry.clock_out_time).getTime() - clockInDate.getTime()) /
                        (1000 * 60 * 60)
                    : 0;
                return {
                    employee_id: entry.user_id,
                    date: clockInDate.toISOString().split('T')[0],
                    clock_in_time: clockInDate.toTimeString().slice(0, 5),
                    clock_out_time: entry.clock_out_time
                        ? new Date(entry.clock_out_time).toTimeString().slice(0, 5)
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
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an HR analytics expert analyzing employee attendance patterns.',
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
        }
        catch (error) {
            this.logger.error(`AI attendance analysis error: ${error}`);
            const errorMsg = error.message || String(error);
            if (errorMsg.toLowerCase().includes('quota') ||
                errorMsg.toLowerCase().includes('insufficient_quota') ||
                errorMsg.includes('429')) {
                this.logger.log('OpenAI quota exceeded, using fallback statistical analysis');
                return this.fallbackService.analyzeAttendancePatterns(employeeId, days);
            }
            return {
                success: false,
                error: errorMsg,
                fallback_available: true,
            };
        }
    }
    async suggestOptimalSchedule(targetDate, departmentId) {
        if (!this.isAvailable) {
            return {
                success: false,
                error: 'OpenAI service not available for schedule optimization',
            };
        }
        try {
            const dayOfWeek = targetDate.getDay();
            const historicalSchedules = await this.prisma.schedules.findMany({
                where: {
                    start_time: {
                        gte: new Date(targetDate.getTime() - 60 * 24 * 60 * 60 * 1000),
                    },
                },
                include: {
                    shift_types: true,
                },
                take: 50,
            });
            const employeesQuery = { is_active: true };
            if (departmentId) {
                employeesQuery.department_id = departmentId;
            }
            const employees = await this.prisma.users.findMany({
                where: employeesQuery,
                include: {
                    user_roles: {
                        include: {
                            roles: true,
                        },
                    },
                },
            });
            const historicalData = historicalSchedules.map((schedule) => ({
                date: new Date(schedule.start_time).toISOString().split('T')[0],
                employee_id: schedule.user_id,
                start_time: new Date(schedule.start_time).toTimeString().slice(0, 5),
                end_time: schedule.end_time
                    ? new Date(schedule.end_time).toTimeString().slice(0, 5)
                    : 'N/A',
                shift_type: schedule.shift_types?.name || 'Regular',
            }));
            const employeeData = employees.map((emp) => ({
                id: emp.id,
                role: emp.user_roles.length > 0
                    ? emp.user_roles[0].roles.name
                    : 'Employee',
                department: emp.department_id || 'General',
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
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a workforce optimization expert creating efficient schedules.',
                    },
                    { role: 'user', content: prompt },
                ],
                response_format: { type: 'json_object' },
            });
            const suggestions = JSON.parse(response.choices[0].message.content || '{}');
            return {
                success: true,
                suggestions,
                target_date: targetDate.toISOString().split('T')[0],
                employees_available: employees.length,
            };
        }
        catch (error) {
            this.logger.error(`AI schedule optimization error: ${error}`);
            return {
                success: false,
                error: error.message || String(error),
            };
        }
    }
    async naturalLanguageQuery(query) {
        if (!this.isAvailable) {
            return {
                success: false,
                error: 'OpenAI service not available for natural language queries',
            };
        }
        try {
            const [totalEmployees, recentEntries, recentSchedules, pendingLeave] = await Promise.all([
                this.prisma.users.count({ where: { is_active: true } }),
                this.prisma.time_entries.count({
                    where: {
                        clock_in_time: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        },
                    },
                }),
                this.prisma.schedules.count({
                    where: {
                        start_time: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        },
                    },
                }),
                this.prisma.leave_applications.count({
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
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful WFM assistant providing insights about workforce data.',
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
        }
        catch (error) {
            this.logger.error(`AI natural language query error: ${error}`);
            return {
                success: false,
                error: error.message || String(error),
            };
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        ai_fallback_service_1.AiFallbackService])
], AiService);
//# sourceMappingURL=ai.service.js.map