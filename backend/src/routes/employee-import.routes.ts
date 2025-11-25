import { Router, Response } from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { query } from '../db/database';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

// Get departments for import (with hierarchy info)
router.get('/departments', requireRole('Super User', 'Admin', 'HR'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT d.code, d.name, s.name as site, r.name as region, c.name as company
       FROM departments d
       INNER JOIN sites s ON d.site_id = s.id
       INNER JOIN regions r ON s.region_id = r.id
       INNER JOIN companies c ON r.company_id = c.id
       WHERE d.is_active = true
       ORDER BY c.name, r.name, s.name, d.name`
    );

    res.json({
      departments: result.rows.map(row => ({
        code: row.code,
        name: row.name,
        site: row.site,
        region: row.region,
        company: row.company
      }))
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to retrieve departments' });
  }
});

// Get stats for import dashboard
router.get('/stats', requireRole('Super User', 'Admin', 'HR'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [employeesResult, activeResult, deptResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM departments WHERE is_active = true')
    ]);

    res.json({
      stats: {
        totalEmployees: parseInt(employeesResult.rows[0].count),
        activeEmployees: parseInt(activeResult.rows[0].count),
        totalDepartments: parseInt(deptResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

// Download CSV template
router.get('/template', requireRole('Super User', 'Admin', 'HR'), async (req: AuthRequest, res: Response): Promise<void> => {
  const templateContent = `employee_id,username,first_name,last_name,email,department_code,phone_number,position,hire_date,employment_type,salary,hourly_rate
EMP001,jdoe,John,Doe,john.doe@company.com,HR,+27123456789,HR Manager,2024-01-15,full_time,75000,
EMP002,jsmith,Jane,Smith,jane.smith@company.com,IT,+27123456790,Software Developer,2024-02-01,full_time,,450.00
EMP003,bwilson,Bob,Wilson,bob.wilson@company.com,SALES,+27123456791,Sales Representative,2024-03-01,part_time,45000,`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=employee_import_template.csv');
  res.send(templateContent);
});

// Validate CSV file
router.post('/validate', requireRole('Super User', 'Admin', 'HR'), upload.single('csv_file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ valid: false, errors: ['No file uploaded'] });
      return;
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      res.status(400).json({ valid: false, errors: ['CSV file is empty or has no data rows'] });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['employee_id', 'first_name', 'last_name', 'email', 'department_code'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      res.status(400).json({ 
        valid: false, 
        errors: [`Missing required columns: ${missingHeaders.join(', ')}`] 
      });
      return;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const validRows: any[] = [];
    const employeeIds = new Set<string>();
    const emails = new Set<string>();

    // Get existing employee IDs and emails
    const existingUsers = await query('SELECT employee_number, email FROM users');
    const existingIds = new Set(existingUsers.rows.map(r => r.employee_number?.toLowerCase()));
    const existingEmails = new Set(existingUsers.rows.map(r => r.email?.toLowerCase()));

    // Get valid department codes
    const deptResult = await query('SELECT code FROM departments WHERE is_active = true');
    const validDeptCodes = new Set(deptResult.rows.map(r => r.code?.toUpperCase()));

    for (let i = 1; i < lines.length; i++) {
      const rowNumber = i + 1;
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx]?.trim() || '';
      });

      const rowErrors: string[] = [];

      // Validate required fields
      const employeeId = row['employee_id'];
      if (!employeeId) {
        rowErrors.push('Employee ID is required');
      } else if (employeeIds.has(employeeId.toLowerCase())) {
        rowErrors.push(`Duplicate Employee ID: ${employeeId}`);
      } else if (existingIds.has(employeeId.toLowerCase())) {
        rowErrors.push(`Employee ID ${employeeId} already exists in database`);
      } else {
        employeeIds.add(employeeId.toLowerCase());
      }

      const firstName = row['first_name'];
      if (!firstName) rowErrors.push('First name is required');

      const lastName = row['last_name'];
      if (!lastName) rowErrors.push('Last name is required');

      const email = row['email']?.toLowerCase();
      if (!email) {
        rowErrors.push('Email is required');
      } else if (!email.includes('@') || !email.includes('.')) {
        rowErrors.push('Invalid email format');
      } else if (emails.has(email)) {
        rowErrors.push(`Duplicate email: ${email}`);
      } else if (existingEmails.has(email)) {
        rowErrors.push(`Email ${email} already exists in database`);
      } else {
        emails.add(email);
      }

      const departmentCode = row['department_code']?.toUpperCase();
      if (!departmentCode) {
        rowErrors.push('Department code is required');
      } else if (!validDeptCodes.has(departmentCode)) {
        rowErrors.push(`Department with code '${departmentCode}' not found`);
      }

      // Validate optional fields
      const hireDate = row['hire_date'];
      if (hireDate) {
        const datePattern = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/;
        if (!datePattern.test(hireDate)) {
          rowErrors.push('Invalid hire date format. Use YYYY-MM-DD or MM/DD/YYYY');
        }
      }

      const employmentType = row['employment_type']?.toLowerCase();
      if (employmentType && !['full_time', 'part_time', 'contract', 'temporary'].includes(employmentType)) {
        rowErrors.push('Employment type must be: full_time, part_time, contract, or temporary');
      }

      const salary = row['salary'];
      if (salary && isNaN(parseFloat(salary))) {
        rowErrors.push('Salary must be a valid number');
      }

      const hourlyRate = row['hourly_rate'];
      if (hourlyRate && isNaN(parseFloat(hourlyRate))) {
        rowErrors.push('Hourly rate must be a valid number');
      }

      if (rowErrors.length > 0) {
        errors.push(`Row ${rowNumber}: ${rowErrors.join('; ')}`);
      } else {
        validRows.push({
          employee_id: employeeId,
          username: row['username'] || email?.split('@')[0] || `user${employeeId}`,
          first_name: firstName,
          last_name: lastName,
          email: email,
          department_code: departmentCode,
          phone_number: row['phone_number'] || '',
          position: row['position'] || '',
          hire_date: hireDate || '',
          employment_type: employmentType || 'full_time',
          salary: salary ? parseFloat(salary) : null,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null
        });
      }
    }

    res.json({
      valid: errors.length === 0 && validRows.length > 0,
      validRows,
      totalRows: lines.length - 1,
      errors,
      warnings
    });
  } catch (error) {
    console.error('Validate CSV error:', error);
    res.status(500).json({ valid: false, errors: ['Error processing CSV file'] });
  }
});

// Execute employee import
router.post('/execute', requireRole('Super User', 'Admin', 'HR'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employees } = req.body;

    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      res.status(400).json({ success: false, errors: ['No employees to import'] });
      return;
    }

    // Get Employee role ID
    let roleResult = await query("SELECT id FROM roles WHERE name = 'Employee'");
    let employeeRoleId: number;

    if (roleResult.rows.length === 0) {
      const createRole = await query(
        "INSERT INTO roles (name, description) VALUES ('Employee', 'Standard employee role') RETURNING id"
      );
      employeeRoleId = createRole.rows[0].id;
    } else {
      employeeRoleId = roleResult.rows[0].id;
    }

    const errors: string[] = [];
    let importedCount = 0;

    for (const emp of employees) {
      try {
        // Find department
        const deptResult = await query(
          'SELECT id FROM departments WHERE code = $1 AND is_active = true',
          [emp.department_code]
        );

        if (deptResult.rows.length === 0) {
          errors.push(`Department ${emp.department_code} not found for employee ${emp.employee_id}`);
          continue;
        }

        const departmentId = deptResult.rows[0].id;

        // Parse hire date
        let hireDate = null;
        if (emp.hire_date) {
          if (emp.hire_date.includes('/')) {
            const [month, day, year] = emp.hire_date.split('/');
            hireDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else {
            hireDate = emp.hire_date;
          }
        }

        // Generate default password
        const defaultPassword = `${emp.first_name.toLowerCase()}${emp.employee_id}`;
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Insert user
        const userResult = await query(
          `INSERT INTO users (
            tenant_id, employee_number, username, first_name, last_name, email,
            password_hash, department_id, phone, hire_date, employment_type,
            annual_salary, hourly_rate, is_active, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, NOW())
          RETURNING id`,
          [
            req.user!.tenantId,
            emp.employee_id,
            emp.username,
            emp.first_name,
            emp.last_name,
            emp.email,
            hashedPassword,
            departmentId,
            emp.phone_number,
            hireDate,
            emp.employment_type,
            emp.salary,
            emp.hourly_rate
          ]
        );

        // Assign Employee role
        await query(
          'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [userResult.rows[0].id, employeeRoleId]
        );

        importedCount++;
      } catch (err: any) {
        errors.push(`Error importing employee ${emp.employee_id}: ${err.message}`);
      }
    }

    res.json({
      success: importedCount > 0,
      importedCount,
      errors
    });
  } catch (error) {
    console.error('Execute import error:', error);
    res.status(500).json({ success: false, errors: ['Failed to import employees'] });
  }
});

// Helper function to parse CSV line (handles quoted values)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

export default router;
