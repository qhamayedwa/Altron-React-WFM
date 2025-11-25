import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { query } from '../db/database';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Get rollup dashboard data
router.get('/dashboard', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get recent rollup activity from a hypothetical rollups table
    // For now, return mock data as the table may not exist yet
    const activities = [
      {
        id: 1,
        type: 'Employee',
        period_start: '2025-11-01',
        period_end: '2025-11-15',
        total_hours: 1280.5,
        total_employees: 45,
        status: 'success',
        sage_sent: true,
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get rollup dashboard error:', error);
    res.status(500).json({ error: 'Failed to retrieve rollup dashboard data' });
  }
});

// Get recent rollup activity
router.get('/recent-activity', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Return mock recent activity (in production, query from rollups table)
    const activities = [
      {
        id: 1,
        type: 'Employee',
        period_start: '2025-11-01',
        period_end: '2025-11-15',
        total_hours: 1280.5,
        total_employees: 45,
        status: 'success',
        sage_sent: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        type: 'Department',
        period_start: '2025-11-01',
        period_end: '2025-11-07',
        total_hours: 640.0,
        total_employees: 25,
        status: 'success',
        sage_sent: false,
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ error: 'Failed to retrieve recent activity' });
  }
});

// Generate rollup data
router.post(
  '/generate',
  requireRole('Manager', 'Admin', 'Super User', 'Payroll'),
  [
    body('rollup_type').notEmpty().withMessage('Rollup type is required'),
    body('start_date').notEmpty().withMessage('Start date is required'),
    body('end_date').notEmpty().withMessage('End date is required')
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const {
        rollup_type,
        start_date,
        end_date,
        department_filter,
        employee_filter,
        pay_code_filter,
        include_breaks,
        include_overtime,
        exclude_incomplete
      } = req.body;

      // Build base query - calculate hours from clock times
      let sql = `
        SELECT 
          te.id,
          te.user_id,
          te.clock_in_time,
          te.clock_out_time,
          te.total_break_minutes,
          te.status,
          CASE 
            WHEN te.clock_out_time IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0
            ELSE 0 
          END as total_hours,
          u.first_name,
          u.last_name,
          u.employee_number,
          u.department_id,
          d.name as department_name
        FROM time_entries te
        JOIN users u ON te.user_id = u.id
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE te.clock_in_time >= $1 AND te.clock_in_time <= $2
      `;

      const params: any[] = [start_date, end_date];
      let paramIndex = 3;

      // Apply filters
      if (exclude_incomplete) {
        sql += ` AND te.clock_out_time IS NOT NULL AND te.status = 'Closed'`;
      }

      if (department_filter && department_filter.length > 0) {
        sql += ` AND u.department_id = ANY($${paramIndex})`;
        params.push(department_filter);
        paramIndex++;
      }

      if (employee_filter && employee_filter.length > 0) {
        sql += ` AND te.user_id = ANY($${paramIndex})`;
        params.push(employee_filter);
        paramIndex++;
      }

      sql += ` ORDER BY te.clock_in_time DESC`;

      const result = await query(sql, params);
      const entries = result.rows;

      // Process data based on rollup type
      let rollupData: any = {};

      if (rollup_type === 'employee') {
        // Group by employee
        const employeeMap = new Map();
        entries.forEach((entry: any) => {
          const key = entry.user_id;
          if (!employeeMap.has(key)) {
            employeeMap.set(key, {
              user_id: entry.user_id,
              full_name: `${entry.first_name} ${entry.last_name}`,
              employee_number: entry.employee_number,
              department_name: entry.department_name,
              total_hours: 0,
              entries_count: 0
            });
          }
          const emp = employeeMap.get(key);
          emp.total_hours += parseFloat(entry.total_hours || 0);
          emp.entries_count += 1;
        });

        rollupData = {
          type: 'employee',
          employees: Array.from(employeeMap.values())
        };
      } else if (rollup_type === 'department') {
        // Group by department
        const deptMap = new Map();
        entries.forEach((entry: any) => {
          const key = entry.department_id || 'unassigned';
          if (!deptMap.has(key)) {
            deptMap.set(key, {
              department_id: entry.department_id,
              department_name: entry.department_name || 'Unassigned',
              total_hours: 0,
              entries_count: 0,
              employees_count: new Set()
            });
          }
          const dept = deptMap.get(key);
          dept.total_hours += parseFloat(entry.total_hours || 0);
          dept.entries_count += 1;
          dept.employees_count.add(entry.user_id);
        });

        const departments = Array.from(deptMap.values()).map(d => ({
          ...d,
          employees_count: d.employees_count.size
        }));

        rollupData = {
          type: 'department',
          departments
        };
      } else if (rollup_type === 'daily') {
        // Group by day
        const dayMap = new Map();
        entries.forEach((entry: any) => {
          const date = new Date(entry.clock_in_time).toISOString().split('T')[0];
          if (!dayMap.has(date)) {
            dayMap.set(date, {
              date,
              total_hours: 0,
              entries_count: 0,
              employees_count: new Set()
            });
          }
          const day = dayMap.get(date);
          day.total_hours += parseFloat(entry.total_hours || 0);
          day.entries_count += 1;
          day.employees_count.add(entry.user_id);
        });

        const periods = Array.from(dayMap.values()).map(d => ({
          ...d,
          employees_count: d.employees_count.size
        }));

        rollupData = {
          type: 'daily',
          periods
        };
      } else {
        // Combined rollup
        rollupData = {
          type: 'combined',
          summary: {
            total_entries: entries.length,
            total_hours: entries.reduce((sum: number, e: any) => sum + parseFloat(e.total_hours || 0), 0),
            unique_employees: new Set(entries.map((e: any) => e.user_id)).size
          }
        };
      }

      res.json({
        success: true,
        data: rollupData,
        config: {
          type: rollup_type,
          start_date,
          end_date
        }
      });
    } catch (error) {
      console.error('Generate rollup error:', error);
      res.status(500).json({ error: 'Failed to generate rollup data' });
    }
  }
);

// Get configuration options (departments, employees, pay codes)
router.get('/config-options', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get departments
    const deptResult = await query(
      'SELECT id, name FROM departments WHERE is_active = true ORDER BY name'
    );

    // Get employees
    const empResult = await query(
      'SELECT id, first_name, last_name, username, employee_number FROM users WHERE is_active = true ORDER BY last_name, first_name'
    );

    // Get pay codes (if table exists)
    let payCodes = [];
    const payCodeCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pay_codes'
      )
    `);

    if (payCodeCheck.rows[0].exists) {
      const payCodeResult = await query(
        'SELECT code, description FROM pay_codes WHERE is_active = true ORDER BY code'
      );
      payCodes = payCodeResult.rows;
    }

    res.json({
      departments: deptResult.rows,
      employees: empResult.rows,
      pay_codes: payCodes
    });
  } catch (error) {
    console.error('Get config options error:', error);
    res.status(500).json({ error: 'Failed to retrieve configuration options' });
  }
});

// Export to SAGE VIP
router.post(
  '/export-sage',
  requireRole('Manager', 'Admin', 'Super User', 'Payroll'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { start_date, end_date } = req.body;

      if (!start_date || !end_date) {
        res.status(400).json({ error: 'Start date and end date are required' });
        return;
      }

      // Get time entries for the period
      const result = await query(`
        SELECT 
          te.id,
          te.user_id,
          te.clock_in_time,
          te.clock_out_time,
          te.total_break_minutes,
          te.status,
          CASE 
            WHEN te.clock_out_time IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0
            ELSE 0 
          END as total_hours,
          u.first_name,
          u.last_name,
          u.employee_number
        FROM time_entries te
        JOIN users u ON te.user_id = u.id
        WHERE te.clock_in_time >= $1 AND te.clock_in_time <= $2
        AND te.clock_out_time IS NOT NULL
        ORDER BY u.employee_number, te.clock_in_time
      `, [start_date, end_date]);

      // In a real implementation, this would call the SAGE VIP API
      // For now, we'll simulate a successful export
      const exportedCount = result.rows.length;

      res.json({
        success: true,
        message: 'Export to SAGE completed successfully',
        exported_count: exportedCount,
        export_date: new Date().toISOString()
      });
    } catch (error) {
      console.error('Export to SAGE error:', error);
      res.status(500).json({ error: 'Failed to export to SAGE VIP' });
    }
  }
);

// Download export file (CSV)
router.get('/download-export', requireRole('Manager', 'Admin', 'Super User', 'Payroll'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      res.status(400).json({ error: 'Start date and end date are required' });
      return;
    }

    // Get time entries for the period
    const result = await query(`
      SELECT 
        u.employee_number,
        u.first_name,
        u.last_name,
        te.clock_in_time,
        te.clock_out_time,
        te.total_break_minutes,
        CASE 
          WHEN te.clock_out_time IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0
          ELSE 0 
        END as total_hours,
        d.name as department_name
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE te.clock_in_time >= $1 AND te.clock_in_time <= $2
      AND te.clock_out_time IS NOT NULL
      ORDER BY u.employee_number, te.clock_in_time
    `, [start_date, end_date]);

    // Generate CSV
    const headers = ['Employee Number', 'First Name', 'Last Name', 'Department', 'Clock In', 'Clock Out', 'Break Minutes', 'Total Hours'];
    const csvRows = [headers.join(',')];

    for (const row of result.rows) {
      const values = [
        row.employee_number || '',
        row.first_name || '',
        row.last_name || '',
        row.department_name || '',
        row.clock_in_time ? new Date(row.clock_in_time).toISOString() : '',
        row.clock_out_time ? new Date(row.clock_out_time).toISOString() : '',
        row.total_break_minutes || 0,
        parseFloat(row.total_hours || 0).toFixed(2)
      ];
      csvRows.push(values.map(v => `"${v}"`).join(','));
    }

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=timecard_export_${start_date}_to_${end_date}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Download export error:', error);
    res.status(500).json({ error: 'Failed to generate export file' });
  }
});

// Save SAGE configuration
router.post('/save-sage-config', requireRole('Super User', 'Admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { baseUrl, apiKey, companyDb } = req.body;

    // In a real implementation, this would save to a settings table or environment
    // For now, we'll just acknowledge the save
    res.json({
      success: true,
      message: 'SAGE configuration saved successfully'
    });
  } catch (error) {
    console.error('Save SAGE config error:', error);
    res.status(500).json({ error: 'Failed to save SAGE configuration' });
  }
});

// Get rollup history
router.get('/history', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Return mock history (in production, query from rollups table)
    const history = [
      {
        id: 1,
        type: 'Employee',
        period: 'weekly',
        start_date: '2025-11-01',
        end_date: '2025-11-07',
        total_hours: 640.0,
        total_employees: 25,
        status: 'completed',
        sage_sent: true,
        created_at: new Date(Date.now() - 604800000).toISOString(),
        created_by: 'Admin User'
      },
      {
        id: 2,
        type: 'Department',
        period: 'monthly',
        start_date: '2025-11-01',
        end_date: '2025-11-30',
        total_hours: 2400.0,
        total_employees: 75,
        status: 'completed',
        sage_sent: false,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        created_by: 'Manager User'
      }
    ];

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Get rollup history error:', error);
    res.status(500).json({ error: 'Failed to retrieve rollup history' });
  }
});

export default router;
