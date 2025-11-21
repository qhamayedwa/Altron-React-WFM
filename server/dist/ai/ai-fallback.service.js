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
var AiFallbackService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiFallbackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_entity_1 = require("../entities/schedule.entity");
const time_entry_entity_1 = require("../entities/time-entry.entity");
const user_entity_1 = require("../entities/user.entity");
let AiFallbackService = AiFallbackService_1 = class AiFallbackService {
    scheduleRepo;
    timeEntryRepo;
    userRepo;
    logger = new common_1.Logger(AiFallbackService_1.name);
    constructor(scheduleRepo, timeEntryRepo, userRepo) {
        this.scheduleRepo = scheduleRepo;
        this.timeEntryRepo = timeEntryRepo;
        this.userRepo = userRepo;
    }
    async analyzeSchedulingPatterns(departmentId, days = 30) {
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
            const schedules = await this.scheduleRepo.find({
                where,
                relations: {
                    users_schedules_user_idTousers: true,
                },
            });
            const totalSchedules = schedules.length;
            if (totalSchedules === 0) {
                return {
                    success: true,
                    suggestions: {
                        patterns: ['No scheduling data available for analysis'],
                        efficiency_score: 0,
                        recommendations: [
                            'Start creating schedules to enable pattern analysis',
                        ],
                    },
                };
            }
            const weekdayDistribution = {};
            const hourDistribution = {};
            const employeeWorkload = {};
            for (const schedule of schedules) {
                const startTime = new Date(schedule.start_time);
                const weekday = startTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                });
                weekdayDistribution[weekday] = (weekdayDistribution[weekday] || 0) + 1;
                const hour = startTime.getHours();
                hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
                const empId = schedule.user_id;
                employeeWorkload[empId] = (employeeWorkload[empId] || 0) + 1;
            }
            const busiestDay = Object.keys(weekdayDistribution).length > 0
                ? Object.keys(weekdayDistribution).reduce((a, b) => weekdayDistribution[a] > weekdayDistribution[b] ? a : b)
                : 'N/A';
            const peakHour = Object.keys(hourDistribution).length > 0
                ? Object.keys(hourDistribution).reduce((a, b) => hourDistribution[Number(a)] > hourDistribution[Number(b)] ? a : b)
                : 'N/A';
            const workloadValues = Object.values(employeeWorkload);
            const avgWorkload = workloadValues.length > 0
                ? workloadValues.reduce((sum, val) => sum + val, 0) /
                    workloadValues.length
                : 0;
            const workloadVariance = workloadValues.length > 0
                ? workloadValues.reduce((sum, val) => sum + Math.pow(val - avgWorkload, 2), 0) / workloadValues.length
                : 0;
            const efficiencyScore = Math.max(0, Math.min(100, 100 - workloadVariance * 10));
            const recommendations = [];
            if (workloadVariance > 2) {
                recommendations.push('Consider redistributing workload more evenly among employees');
            }
            if (Object.keys(weekdayDistribution).length < 5) {
                recommendations.push('Consider expanding schedule coverage to more weekdays');
            }
            if (efficiencyScore < 70) {
                recommendations.push('Review scheduling patterns for optimization opportunities');
            }
            return {
                success: true,
                suggestions: {
                    patterns: [
                        `Busiest day: ${busiestDay}`,
                        `Peak scheduling hour: ${peakHour}:00`,
                        `Total schedules analyzed: ${totalSchedules}`,
                        `Average workload per employee: ${avgWorkload.toFixed(1)}`,
                    ],
                    efficiency_score: Math.round(efficiencyScore),
                    recommendations: recommendations.length > 0
                        ? recommendations
                        : ['Current scheduling appears well-balanced'],
                },
            };
        }
        catch (error) {
            this.logger.error(`Fallback scheduling analysis error: ${error}`);
            return {
                success: false,
                error: error.message || String(error),
                suggestions: {
                    patterns: ['Analysis temporarily unavailable'],
                    efficiency_score: 0,
                    recommendations: ['Please try again later'],
                },
            };
        }
    }
    async generatePayrollInsights(payPeriodStart, payPeriodEnd) {
        try {
            const timeEntries = await this.timeEntryRepo.find({
                where: {
                    clock_in_time: {
                        gte: payPeriodStart,
                        lte: new Date(payPeriodEnd.getTime() + 24 * 60 * 60 * 1000),
                    },
                    clock_out_time: { not: null },
                },
            });
            if (timeEntries.length === 0) {
                return {
                    success: true,
                    insights: {
                        anomalies_detected: [],
                        cost_analysis: {
                            total_payroll_cost: 'No data available',
                            overtime_percentage: '0%',
                            average_hourly_rate: 'N/A',
                        },
                        recommendations: ['No time entries found for this period'],
                        compliance_notes: ['Ensure employees are tracking their time'],
                        efficiency_insights: ['Time tracking adoption appears low'],
                    },
                };
            }
            const employeeHours = {};
            const dailyTotals = {};
            for (const entry of timeEntries) {
                if (entry.clock_out_time) {
                    const hours = (new Date(entry.clock_out_time).getTime() -
                        new Date(entry.clock_in_time).getTime()) /
                        (1000 * 60 * 60);
                    employeeHours[entry.user_id] =
                        (employeeHours[entry.user_id] || 0) + hours;
                    const day = new Date(entry.clock_in_time)
                        .toISOString()
                        .split('T')[0];
                    dailyTotals[day] = (dailyTotals[day] || 0) + hours;
                }
            }
            const totalHours = Object.values(employeeHours).reduce((sum, h) => sum + h, 0);
            const anomalies = [];
            const avgDailyHours = Object.keys(dailyTotals).length > 0
                ? Object.values(dailyTotals).reduce((sum, h) => sum + h, 0) /
                    Object.keys(dailyTotals).length
                : 0;
            for (const [day, hours] of Object.entries(dailyTotals)) {
                if (hours > avgDailyHours * 1.5) {
                    anomalies.push({
                        type: 'high_daily_hours',
                        date: day,
                        description: `Unusually high daily hours: ${hours.toFixed(1)}`,
                        severity: 'medium',
                    });
                }
            }
            for (const [empId, hours] of Object.entries(employeeHours)) {
                if (hours > 50) {
                    anomalies.push({
                        type: 'potential_overtime',
                        employee_id: String(empId),
                        description: `Employee worked ${hours.toFixed(1)} hours this period`,
                        severity: hours > 60 ? 'high' : 'medium',
                    });
                }
            }
            const overtimeHours = Object.values(employeeHours).reduce((sum, h) => sum + Math.max(0, h - 40), 0);
            const overtimePercentage = totalHours > 0 ? (overtimeHours / totalHours) * 100 : 0;
            const recommendations = [];
            if (overtimePercentage > 10) {
                recommendations.push('Consider hiring additional staff to reduce overtime');
            }
            if (Object.keys(employeeHours).length < 5) {
                recommendations.push('Monitor staffing levels for adequate coverage');
            }
            if (avgDailyHours < 20) {
                recommendations.push('Review daily scheduling to optimize productivity');
            }
            return {
                success: true,
                insights: {
                    anomalies_detected: anomalies,
                    cost_analysis: {
                        total_hours_worked: totalHours.toFixed(1),
                        overtime_percentage: `${overtimePercentage.toFixed(1)}%`,
                        employees_tracked: String(Object.keys(employeeHours).length),
                    },
                    recommendations: recommendations.length > 0
                        ? recommendations
                        : ['Payroll patterns appear normal'],
                    compliance_notes: ['Review overtime policies if applicable'],
                    efficiency_insights: [
                        `Average daily hours: ${avgDailyHours.toFixed(1)}`,
                        `Peak workday hours: ${Math.max(...Object.values(dailyTotals), 0).toFixed(1)}`,
                    ],
                },
            };
        }
        catch (error) {
            this.logger.error(`Fallback payroll analysis error: ${error}`);
            return {
                success: false,
                error: error.message || String(error),
                insights: {
                    anomalies_detected: [],
                    cost_analysis: {
                        total_payroll_cost: 'Error calculating',
                        overtime_percentage: '0%',
                    },
                    recommendations: ['Please try again later'],
                    compliance_notes: [],
                    efficiency_insights: [],
                },
            };
        }
    }
    async analyzeAttendancePatterns(employeeId, days = 30) {
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
            const entries = await this.timeEntryRepo.find({
                where,
            });
            if (entries.length === 0) {
                return {
                    success: true,
                    insights: {
                        patterns: ['No attendance data available'],
                        risk_factors: [],
                        recommendations: ['Encourage employees to use time tracking'],
                        period_summary: `Analysis of ${days} days ending ${endDate.toISOString().split('T')[0]}`,
                    },
                };
            }
            const dailyAttendance = {};
            let lateArrivals = 0;
            let earlyDepartures = 0;
            const employeeAttendance = {};
            for (const entry of entries) {
                const day = new Date(entry.clock_in_time).toISOString().split('T')[0];
                dailyAttendance[day] = (dailyAttendance[day] || 0) + 1;
                const empId = entry.user_id;
                employeeAttendance[empId] = (employeeAttendance[empId] || 0) + 1;
                if (new Date(entry.clock_in_time).getHours() > 9) {
                    lateArrivals++;
                }
                if (entry.clock_out_time &&
                    new Date(entry.clock_out_time).getHours() < 17) {
                    earlyDepartures++;
                }
            }
            const avgDailyAttendance = Object.keys(dailyAttendance).length > 0
                ? Object.values(dailyAttendance).reduce((sum, val) => sum + val, 0) /
                    Object.keys(dailyAttendance).length
                : 0;
            const totalEntries = entries.length;
            const latePercentage = totalEntries > 0 ? (lateArrivals / totalEntries) * 100 : 0;
            const patterns = [
                `Total attendance entries: ${totalEntries}`,
                `Average daily attendance: ${avgDailyAttendance.toFixed(1)}`,
                `Late arrivals: ${latePercentage.toFixed(1)}%`,
            ];
            const riskFactors = [];
            if (latePercentage > 20) {
                riskFactors.push('High rate of late arrivals detected');
            }
            if (avgDailyAttendance < 5) {
                riskFactors.push('Low daily attendance rates');
            }
            const recommendations = [];
            if (latePercentage > 15) {
                recommendations.push('Consider reviewing arrival time policies');
            }
            if (Object.keys(employeeAttendance).length < 10) {
                recommendations.push('Encourage more employees to use time tracking');
            }
            return {
                success: true,
                insights: {
                    patterns,
                    risk_factors: riskFactors.length > 0
                        ? riskFactors
                        : ['No significant risk factors detected'],
                    recommendations: recommendations.length > 0
                        ? recommendations
                        : ['Attendance patterns appear normal'],
                    period_summary: `Analysis of ${days} days ending ${endDate.toISOString().split('T')[0]}`,
                },
            };
        }
        catch (error) {
            this.logger.error(`Fallback attendance analysis error: ${error}`);
            return {
                success: false,
                error: error.message || String(error),
                insights: {
                    patterns: ['Analysis temporarily unavailable'],
                    risk_factors: [],
                    recommendations: ['Please try again later'],
                    period_summary: '',
                },
            };
        }
    }
};
exports.AiFallbackService = AiFallbackService;
exports.AiFallbackService = AiFallbackService = AiFallbackService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(schedule_entity_1.Schedule)),
    __param(1, (0, typeorm_1.InjectRepository)(time_entry_entity_1.TimeEntry)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AiFallbackService);
//# sourceMappingURL=ai-fallback.service.js.map