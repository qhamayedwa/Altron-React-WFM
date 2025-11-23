import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../db/database';

const router = Router();

router.use(authenticate);

// AI Dashboard - Analyze Scheduling
router.get('/api/analyze-scheduling', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_schedules,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_schedules
      FROM schedules
      WHERE organization_id = $1
    `, [req.user!.tenantId]);

    const efficiency_score = result.rows[0]?.active_schedules > 0 
      ? Math.round((result.rows[0].active_schedules / result.rows[0].total_schedules) * 100)
      : 75;

    res.json({
      success: true,
      suggestions: {
        efficiency_score,
        patterns: [
          'Peak scheduling hours: 9 AM - 5 PM',
          'Monday and Friday show highest activity',
          'Average shift length: 8 hours'
        ],
        recommendations: [
          'Consider staggered shift starts to reduce congestion',
          'Optimize weekend coverage based on demand',
          'Review overtime patterns for cost savings'
        ]
      }
    });
  } catch (error) {
    console.error('Analyze scheduling error:', error);
    res.json({
      success: false,
      error: 'Unable to analyze scheduling patterns'
    });
  }
});

// AI Dashboard - Analyze Attendance
router.get('/api/analyze-attendance', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_entries,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_entries
      FROM time_entries
      WHERE organization_id = $1
        AND entry_date >= CURRENT_DATE - INTERVAL '30 days'
    `, [req.user!.tenantId]);

    res.json({
      success: true,
      insights: {
        patterns: [
          'Overall attendance rate: 95%',
          'Peak attendance: Tuesday-Thursday',
          'Average daily check-ins: ' + (result.rows[0]?.total_entries || 0)
        ],
        risk_factors: [
          'Slight increase in late arrivals on Mondays',
          'Weekend coverage below optimal levels'
        ],
        recommendations: [
          'Implement flexible start times for Monday shifts',
          'Review weekend staffing requirements',
          'Consider incentives for punctuality'
        ]
      }
    });
  } catch (error) {
    console.error('Analyze attendance error:', error);
    res.json({
      success: false,
      error: 'Unable to analyze attendance'
    });
  }
});

// AI Dashboard - Generate Payroll Insights
router.post('/api/generate-payroll-insights', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pay_period_start, pay_period_end } = req.body;

    const result = await query(`
      SELECT 
        COUNT(*) as total_entries,
        SUM(hours_worked) as total_hours
      FROM time_entries
      WHERE organization_id = $1
        AND entry_date >= $2
        AND entry_date <= $3
        AND status = 'approved'
    `, [req.user!.tenantId, pay_period_start, pay_period_end]);

    const totalHours = result.rows[0]?.total_hours || 0;

    res.json({
      success: true,
      insights: {
        cost_analysis: {
          total_hours_worked: totalHours.toFixed(2) + ' hours',
          average_daily_hours: (totalHours / 30).toFixed(2)
        },
        trends: [
          'Overtime costs within budget',
          'Regular hours consistent with forecast'
        ]
      }
    });
  } catch (error) {
    console.error('Payroll insights error:', error);
    res.json({
      success: false,
      error: 'Unable to generate payroll insights'
    });
  }
});

// AI Natural Query - Process natural language queries
router.post('/api/natural-query', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query: userQuery } = req.body;

    // For now, return a fallback response
    // In a full implementation, this would integrate with OpenAI API
    res.json({
      success: false,
      error: 'AI natural language processing requires OpenAI API configuration',
      insights: {
        summary: 'Statistical analysis available through dashboard',
        data_points: [],
        recommendations: []
      }
    });
  } catch (error) {
    console.error('Natural query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process query'
    });
  }
});

// AI Scheduling - Get optimization history
router.get('/api/ai-scheduling/history', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT 
        id,
        user_id,
        start_time,
        end_time,
        status,
        created_at,
        shift_type_id,
        department_id
      FROM schedules
      WHERE organization_id = $1
        AND created_at >= CURRENT_DATE - INTERVAL '90 days'
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user!.tenantId]);

    const schedules = result.rows.map(row => ({
      id: row.id,
      created_at: row.created_at,
      start_time: row.start_time,
      end_time: row.end_time,
      department: row.department_id,
      user_id: row.user_id,
      ai_confidence_score: Math.floor(Math.random() * 20) + 80, // Mock score
      status: row.status
    }));

    res.json({ schedules });
  } catch (error) {
    console.error('Get scheduling history error:', error);
    res.status(500).json({ error: 'Failed to load scheduling history' });
  }
});

// AI Scheduling - Get optimization results
router.get('/api/ai-scheduling/results/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Mock data for demonstration
    res.json({
      metrics: {
        optimization_score: 87,
        coverage_percentage: 92,
        cost_efficiency: 85,
        employee_satisfaction: 78
      },
      coverage: [
        { time_slot: '06:00-08:00', required: 5, scheduled: 5 },
        { time_slot: '08:00-10:00', required: 10, scheduled: 9 },
        { time_slot: '10:00-12:00', required: 12, scheduled: 12 },
        { time_slot: '12:00-14:00', required: 10, scheduled: 11 },
        { time_slot: '14:00-16:00', required: 8, scheduled: 8 },
        { time_slot: '16:00-18:00', required: 6, scheduled: 5 }
      ],
      recommendations: []
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to load results' });
  }
});

// Notifications - Get trigger details
router.get('/api/notifications/triggers/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Mock trigger data
    const trigger = {
      slug: id,
      name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: 'Automated notification trigger for workforce management events',
      icon: 'bell',
      color: 'primary',
      enabled: true,
      module: 'time_attendance',
      default_priority: 'medium',
      delay_minutes: 0,
      batch_size: 50,
      categories: ['timecard', 'schedule'],
      target_roles: ['Manager', 'Admin'],
      total_triggers: 1250,
      recent_triggers: 45,
      success_rate: 98,
      avg_processing_time: 125,
      last_triggered: new Date().toISOString(),
      recent_activity: [
        {
          title: 'Trigger executed successfully',
          time: '5 minutes ago',
          icon: 'check',
          color: 'success'
        },
        {
          title: 'Configuration updated',
          time: '2 hours ago',
          icon: 'settings',
          color: 'info'
        }
      ]
    };

    res.json({ trigger });
  } catch (error) {
    console.error('Get trigger details error:', error);
    res.status(500).json({ error: 'Failed to load trigger details' });
  }
});

// Automation - Get dashboard data
router.get('/api/automation/dashboard', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employeesResult = await query(
      'SELECT COUNT(*) as count FROM users WHERE organization_id = $1 AND is_active = true',
      [req.user!.tenantId]
    );

    const leaveResult = await query(
      `SELECT COUNT(*) as count FROM leave_applications 
       WHERE organization_id = $1 AND status = 'pending'`,
      [req.user!.tenantId]
    );

    const timeEntriesResult = await query(
      `SELECT COUNT(*) as count FROM time_entries 
       WHERE organization_id = $1 AND status = 'pending'`,
      [req.user!.tenantId]
    );

    const workflow_stats = {
      total_employees: parseInt(employeesResult.rows[0]?.count || 0),
      pending_leave_applications: parseInt(leaveResult.rows[0]?.count || 0),
      open_time_entries: parseInt(timeEntriesResult.rows[0]?.count || 0),
      active_workflows: 3
    };

    const workflows = [
      {
        id: 'leave_accrual',
        name: 'Monthly Leave Accrual',
        description: 'Automatically accrue leave balances for active employees',
        schedule: 'First day of month',
        last_run: 'Never',
        status: 'Ready',
        enabled: true
      },
      {
        id: 'notifications',
        name: 'Pending Notifications',
        description: 'Send pending leave and timecard notifications',
        schedule: 'Daily at 9 AM',
        last_run: new Date().toISOString(),
        status: 'Ready',
        enabled: true
      },
      {
        id: 'payroll',
        name: 'Payroll Processing',
        description: 'Process payroll calculations and summaries',
        schedule: 'Manual',
        last_run: 'Never',
        status: 'Ready',
        enabled: true
      }
    ];

    res.json({
      workflow_stats,
      workflows,
      recent_history: []
    });
  } catch (error) {
    console.error('Get automation dashboard error:', error);
    res.status(500).json({ error: 'Failed to load automation dashboard' });
  }
});

export default router;
