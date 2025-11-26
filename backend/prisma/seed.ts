import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create or get Tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'TimeLogic AI Demo',
      subdomain: 'demo',
      isActive: true,
    },
  });
  console.log('Created/Found tenant:', tenant.name);

  // Create Company
  const company = await prisma.company.create({
    data: {
      tenantId: tenant.id,
      name: 'TimeLogic AI Demo Company',
      city: 'Johannesburg',
      country: 'South Africa',
      isActive: true,
    },
  });
  console.log('Created company:', company.name);

  // Create Region
  const region = await prisma.region.create({
    data: {
      companyId: company.id,
      name: 'Gauteng',
      code: 'GP',
      isActive: true,
    },
  });
  console.log('Created region:', region.name);

  // Create Site
  const site = await prisma.site.create({
    data: {
      regionId: region.id,
      name: 'Johannesburg Head Office',
      code: 'JHB-HQ',
      addressLine1: '123 Main Street, Sandton',
      city: 'Johannesburg',
      stateProvince: 'Gauteng',
      country: 'South Africa',
      postalCode: '2196',
      latitude: -26.1076,
      longitude: 28.0567,
      isActive: true,
    },
  });
  console.log('Created site:', site.name);

  // Create Department
  const department = await prisma.department.create({
    data: {
      siteId: site.id,
      name: 'Operations',
      code: 'OPS',
      isActive: true,
    },
  });
  console.log('Created department:', department.name);

  // Create IT Department
  const itDepartment = await prisma.department.create({
    data: {
      siteId: site.id,
      name: 'Information Technology',
      code: 'IT',
      isActive: true,
    },
  });

  // Create Roles
  const superUserRole = await prisma.role.create({
    data: {
      name: 'Super User',
      description: 'Full system access',
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: 'Manager',
      description: 'Team management and approvals',
    },
  });

  const employeeRole = await prisma.role.create({
    data: {
      name: 'Employee',
      description: 'Standard employee access',
    },
  });
  console.log('Created roles');

  // Create Job Titles
  const managerJob = await prisma.job.create({
    data: {
      title: 'Operations Manager',
      code: 'OPS_MGR',
      description: 'Manages operations team',
      level: 'Manager',
      isActive: true,
    },
  });

  const analystJob = await prisma.job.create({
    data: {
      title: 'Business Analyst',
      code: 'BA',
      description: 'Analyzes business processes',
      level: 'Professional',
      isActive: true,
    },
  });
  console.log('Created job titles');

  // Create Users
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const superAdmin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      username: 'admin',
      email: 'admin@timelogic.ai',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      employeeNumber: 'EMP001',
      departmentId: itDepartment.id,
      employmentStatus: 'active',
      employmentType: 'full_time',
      hireDate: new Date('2024-01-01'),
      standardHoursPerWeek: 40,
      hourlyRate: 500.0,
      isActive: true,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: superAdmin.id,
      roleId: superUserRole.id,
    },
  });
  console.log('Created super admin user');

  const manager = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      username: 'jsmith',
      email: 'jsmith@timelogic.ai',
      passwordHash,
      firstName: 'John',
      lastName: 'Smith',
      employeeNumber: 'EMP002',
      departmentId: department.id,
      jobId: managerJob.id,
      employmentStatus: 'active',
      employmentType: 'full_time',
      hireDate: new Date('2023-06-15'),
      standardHoursPerWeek: 40,
      hourlyRate: 350.0,
      isActive: true,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: manager.id,
      roleId: managerRole.id,
    },
  });

  // Update department with manager
  await prisma.department.update({
    where: { id: department.id },
    data: { managerId: manager.id },
  });
  console.log('Created manager user');

  const employee = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      username: 'sjohnson',
      email: 'sjohnson@timelogic.ai',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Johnson',
      employeeNumber: 'EMP003',
      departmentId: department.id,
      jobId: analystJob.id,
      managerId: manager.id,
      employmentStatus: 'active',
      employmentType: 'full_time',
      hireDate: new Date('2024-03-01'),
      standardHoursPerWeek: 40,
      hourlyRate: 250.0,
      isActive: true,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: employee.id,
      roleId: employeeRole.id,
    },
  });
  console.log('Created employee user');

  // Create Leave Types
  const annualLeave = await prisma.leaveType.create({
    data: {
      name: 'Annual Leave',
      code: 'ANNUAL',
      description: 'Paid annual vacation leave',
      accrualRate: 1.25,
      maxDaysPerYear: 15,
      carryOverDays: 5,
      isPaid: true,
      requiresApproval: true,
      isActive: true,
    },
  });

  const sickLeave = await prisma.leaveType.create({
    data: {
      name: 'Sick Leave',
      code: 'SICK',
      description: 'Paid sick leave',
      accrualRate: 1.0,
      maxDaysPerYear: 12,
      carryOverDays: 0,
      isPaid: true,
      requiresApproval: true,
      isActive: true,
    },
  });

  const familyResponsibility = await prisma.leaveType.create({
    data: {
      name: 'Family Responsibility',
      code: 'FAMILY',
      description: 'Leave for family emergencies',
      accrualRate: 0,
      maxDaysPerYear: 3,
      carryOverDays: 0,
      isPaid: true,
      requiresApproval: true,
      isActive: true,
    },
  });
  console.log('Created leave types');

  // Create Leave Balances
  await prisma.leaveBalance.create({
    data: {
      userId: employee.id,
      leaveTypeId: annualLeave.id,
      year: 2025,
      totalDays: 15,
      usedDays: 2,
      remainingDays: 13,
    },
  });

  await prisma.leaveBalance.create({
    data: {
      userId: employee.id,
      leaveTypeId: sickLeave.id,
      year: 2025,
      totalDays: 12,
      usedDays: 1,
      remainingDays: 11,
    },
  });
  console.log('Created leave balances');

  // Create Shift Types
  const dayShift = await prisma.shiftType.create({
    data: {
      name: 'Day Shift',
      code: 'DAY',
      startTime: '08:00',
      endTime: '17:00',
      duration: 8,
      color: '#28a745',
      isActive: true,
    },
  });

  const nightShift = await prisma.shiftType.create({
    data: {
      name: 'Night Shift',
      code: 'NIGHT',
      startTime: '22:00',
      endTime: '06:00',
      duration: 8,
      color: '#6c757d',
      isActive: true,
    },
  });

  const halfDay = await prisma.shiftType.create({
    data: {
      name: 'Half Day',
      code: 'HALF',
      startTime: '08:00',
      endTime: '12:00',
      duration: 4,
      color: '#17a2b8',
      isActive: true,
    },
  });
  console.log('Created shift types');

  // Create Pay Codes
  await prisma.payCode.create({
    data: {
      tenantId: tenant.id,
      code: 'REG',
      name: 'Regular Hours',
      description: 'Standard working hours',
      codeType: 'earning',
      category: 'regular',
      multiplier: 1.0,
      isTaxable: true,
      isActive: true,
    },
  });

  await prisma.payCode.create({
    data: {
      tenantId: tenant.id,
      code: 'OT15',
      name: 'Overtime 1.5x',
      description: 'Standard overtime at 1.5x rate',
      codeType: 'earning',
      category: 'overtime',
      multiplier: 1.5,
      isTaxable: true,
      isActive: true,
    },
  });

  await prisma.payCode.create({
    data: {
      tenantId: tenant.id,
      code: 'OT20',
      name: 'Overtime 2.0x',
      description: 'Double time overtime at 2.0x rate',
      codeType: 'earning',
      category: 'overtime',
      multiplier: 2.0,
      isTaxable: true,
      isActive: true,
    },
  });

  await prisma.payCode.create({
    data: {
      tenantId: tenant.id,
      code: 'LEAVE',
      name: 'Paid Leave',
      description: 'Paid leave hours',
      codeType: 'earning',
      category: 'leave',
      multiplier: 1.0,
      isTaxable: true,
      isActive: true,
    },
  });
  console.log('Created pay codes');

  // Create Pay Rules
  await prisma.payRule.create({
    data: {
      name: 'Standard Overtime Rule',
      code: 'OT_STANDARD',
      ruleType: 'overtime',
      description: 'Apply 1.5x multiplier after 8 hours per day',
      priority: 1,
      isActive: true,
      config: {
        dailyThreshold: 8,
        multiplier: 1.5,
        payCodeId: 'OT15',
      },
    },
  });

  await prisma.payRule.create({
    data: {
      name: 'Weekend Double Time',
      code: 'OT_WEEKEND',
      ruleType: 'overtime',
      description: 'Apply 2.0x multiplier for weekend work',
      priority: 2,
      isActive: true,
      config: {
        daysOfWeek: [0, 6],
        multiplier: 2.0,
        payCodeId: 'OT20',
      },
    },
  });
  console.log('Created pay rules');

  // Create Holidays (South African public holidays 2025)
  const holidays2025 = [
    { name: "New Year's Day", date: '2025-01-01' },
    { name: 'Human Rights Day', date: '2025-03-21' },
    { name: 'Good Friday', date: '2025-04-18' },
    { name: 'Family Day', date: '2025-04-21' },
    { name: 'Freedom Day', date: '2025-04-27' },
    { name: "Workers' Day", date: '2025-05-01' },
    { name: 'Youth Day', date: '2025-06-16' },
    { name: 'National Women\'s Day', date: '2025-08-09' },
    { name: 'Heritage Day', date: '2025-09-24' },
    { name: 'Day of Reconciliation', date: '2025-12-16' },
    { name: 'Christmas Day', date: '2025-12-25' },
    { name: 'Day of Goodwill', date: '2025-12-26' },
  ];

  for (const holiday of holidays2025) {
    await prisma.holiday.create({
      data: {
        tenantId: tenant.id,
        name: holiday.name,
        date: new Date(holiday.date),
        holidayType: 'public',
        isRecurring: true,
        isPaid: true,
        appliesToAll: true,
        isActive: true,
      },
    });
  }
  console.log('Created 2025 South African holidays');

  // Create Compliance Rules
  await prisma.complianceRule.create({
    data: {
      tenantId: tenant.id,
      name: 'Maximum Daily Hours',
      code: 'MAX_DAILY_HOURS',
      ruleType: 'max_hours',
      description: 'Employees should not work more than 10 hours per day',
      condition: JSON.stringify({ field: 'daily_hours', operator: '>', value: 10 }),
      threshold: 10,
      thresholdUnit: 'hours',
      severity: 'warning',
      notifyManager: true,
      notifyEmployee: true,
      isActive: true,
    },
  });

  await prisma.complianceRule.create({
    data: {
      tenantId: tenant.id,
      name: 'Minimum Break Time',
      code: 'MIN_BREAK',
      ruleType: 'min_break',
      description: 'Employees must take at least 30 minutes break after 5 hours of work',
      condition: JSON.stringify({ field: 'break_minutes', operator: '<', value: 30, when: { field: 'worked_hours', operator: '>=', value: 5 } }),
      threshold: 30,
      thresholdUnit: 'minutes',
      severity: 'violation',
      notifyManager: true,
      notifyEmployee: true,
      isActive: true,
    },
  });
  console.log('Created compliance rules');

  // Create Geofences
  await prisma.geofence.create({
    data: {
      tenantId: tenant.id,
      siteId: site.id,
      name: 'JHB Head Office Geofence',
      description: 'Geofence boundary for Johannesburg Head Office',
      latitude: -26.1076,
      longitude: 28.0567,
      radiusMeters: 200,
      geofenceType: 'circle',
      isClockInAllowed: true,
      isClockOutAllowed: true,
      isActive: true,
    },
  });
  console.log('Created geofences');

  // Create Devices
  await prisma.device.create({
    data: {
      tenantId: tenant.id,
      siteId: site.id,
      name: 'Main Entrance Biometric',
      deviceType: 'biometric',
      serialNumber: 'BIO-001-JHB',
      status: 'active',
      isActive: true,
    },
  });

  await prisma.device.create({
    data: {
      tenantId: tenant.id,
      siteId: site.id,
      name: 'Reception Kiosk',
      deviceType: 'kiosk',
      serialNumber: 'KIOSK-001-JHB',
      status: 'active',
      isActive: true,
    },
  });
  console.log('Created devices');

  // Create Approval Workflow
  await prisma.approvalWorkflow.create({
    data: {
      tenantId: tenant.id,
      name: 'Standard Leave Approval',
      entityType: 'leave_request',
      description: 'Standard approval workflow for leave requests',
      stepsConfig: JSON.stringify([
        { step: 1, approverType: 'manager', required: true },
        { step: 2, approverType: 'role', roleCode: 'HR', required: false },
      ]),
      isDefault: true,
      isActive: true,
    },
  });

  await prisma.approvalWorkflow.create({
    data: {
      tenantId: tenant.id,
      name: 'Time Entry Approval',
      entityType: 'time_entry',
      description: 'Approval workflow for time entries',
      stepsConfig: JSON.stringify([
        { step: 1, approverType: 'manager', required: true },
      ]),
      isDefault: true,
      isActive: true,
    },
  });
  console.log('Created approval workflows');

  // Create Leave Policy
  await prisma.leavePolicy.create({
    data: {
      tenantId: tenant.id,
      name: 'Standard Annual Leave Policy',
      leaveTypeId: annualLeave.id,
      accrualRate: 1.25,
      accrualFrequency: 'monthly',
      maxAccrual: 30,
      maxCarryOver: 5,
      carryOverExpiry: 3,
      waitingPeriodDays: 0,
      minServiceMonths: 0,
      approvalLevels: 1,
      effectiveFrom: new Date('2025-01-01'),
      isActive: true,
    },
  });
  console.log('Created leave policies');

  // Create sample Time Entries
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.timeEntry.create({
    data: {
      userId: employee.id,
      departmentId: department.id,
      clockInTime: new Date(`${yesterday.toISOString().split('T')[0]}T08:00:00`),
      clockOutTime: new Date(`${yesterday.toISOString().split('T')[0]}T17:00:00`),
      clockInLatitude: -26.1076,
      clockInLongitude: 28.0567,
      clockOutLatitude: -26.1076,
      clockOutLongitude: 28.0567,
      geofenceStatus: 'inside',
      breakMinutes: 60,
      totalHours: 8,
      status: 'approved',
      approvedBy: manager.id,
      approvedAt: yesterday,
      exceptionFlag: false,
      complianceStatus: 'compliant',
    },
  });
  console.log('Created sample time entries');

  // Create Notifications
  await prisma.notification.create({
    data: {
      userId: manager.id,
      type: 'leave_request',
      title: 'New Leave Request',
      message: 'Sarah Johnson has submitted a leave request for review.',
      priority: 'medium',
      isRead: false,
      actionUrl: '/leave/approvals',
      actionText: 'Review Request',
    },
  });

  await prisma.notification.create({
    data: {
      userId: employee.id,
      type: 'schedule',
      title: 'Schedule Published',
      message: 'Your schedule for next week has been published.',
      priority: 'low',
      isRead: false,
      actionUrl: '/schedule',
      actionText: 'View Schedule',
    },
  });
  console.log('Created notifications');

  // Create Announcements
  await prisma.announcement.create({
    data: {
      tenantId: tenant.id,
      title: 'Welcome to TimeLogic AI',
      content: 'Welcome to the TimeLogic AI Workforce Management System. This platform helps you manage your time, leave, and schedules efficiently.',
      priority: 'normal',
      targetAudience: 'all',
      publishedAt: new Date(),
      isPinned: true,
      createdBy: superAdmin.id,
      isActive: true,
    },
  });
  console.log('Created announcements');

  console.log('\nDatabase seeding completed successfully!');
  console.log('\nDemo Accounts:');
  console.log('  Super Admin: admin / Admin123!');
  console.log('  Manager:     jsmith / Admin123!');
  console.log('  Employee:    sjohnson / Admin123!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
