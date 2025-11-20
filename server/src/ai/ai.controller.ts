import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('analyze-scheduling')
  @Roles('Manager', 'Super User', 'system_super_admin', 'HR')
  async analyzeScheduling(
    @Query('department_id') departmentId?: string,
    @Query('days') days?: string,
  ) {
    const result = await this.aiService.analyzeSchedulingPatterns(
      departmentId ? parseInt(departmentId) : undefined,
      days ? parseInt(days) : 30,
    );

    return {
      success: result.success,
      data: result,
    };
  }

  @Post('generate-payroll-insights')
  @Roles('Manager', 'Super User', 'system_super_admin', 'Payroll')
  async generatePayrollInsights(
    @Body() body: { start_date: string; end_date: string },
  ) {
    const result = await this.aiService.generatePayrollInsights(
      new Date(body.start_date),
      new Date(body.end_date),
    );

    return {
      success: result.success,
      data: result,
    };
  }

  @Get('analyze-attendance')
  @Roles('Manager', 'Super User', 'system_super_admin', 'HR')
  async analyzeAttendance(
    @Query('employee_id') employeeId?: string,
    @Query('days') days?: string,
  ) {
    const result = await this.aiService.analyzeAttendancePatterns(
      employeeId ? parseInt(employeeId) : undefined,
      days ? parseInt(days) : 30,
    );

    return {
      success: result.success,
      data: result,
    };
  }

  @Post('suggest-schedule')
  @Roles('Manager', 'Super User', 'system_super_admin')
  async suggestSchedule(
    @Body() body: { target_date: string; department_id?: number },
  ) {
    const result = await this.aiService.suggestOptimalSchedule(
      new Date(body.target_date),
      body.department_id,
    );

    return {
      success: result.success,
      data: result,
    };
  }

  @Post('natural-query')
  @Roles('Manager', 'Super User', 'system_super_admin', 'HR', 'Payroll')
  async naturalQuery(@Body() body: { query: string }) {
    if (!body.query || body.query.trim().length === 0) {
      return {
        success: false,
        error: 'Query cannot be empty',
      };
    }

    const result = await this.aiService.naturalLanguageQuery(
      body.query.trim(),
    );

    return {
      success: result.success,
      data: result,
    };
  }

  @Get('quick-insights')
  async quickInsights(@Request() req: any) {
    return {
      success: true,
      insights: {
        workforce_status: 'Analyzing current workforce patterns...',
        efficiency_score: 'Calculating efficiency metrics...',
        recommendations: ['Enable AI insights for detailed analysis'],
      },
    };
  }

  @Post('test-connection')
  @Roles('Super User', 'system_super_admin')
  async testConnection() {
    try {
      const result = await this.aiService.naturalLanguageQuery(
        'Test connection - what is the current date?',
      );

      if (result.success) {
        return {
          success: true,
          message: 'OpenAI connection successful',
          test_result: result,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Connection test failed',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Connection test failed: ${error.message || String(error)}`,
      };
    }
  }
}
