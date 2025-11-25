import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import { 
  Sliders, Save, RefreshCw, ArrowLeft, User, Users, Shield, 
  Activity, Building2, Clock, Cpu, Calendar, Brain, Bell, Eye,
  LucideIcon
} from 'lucide-react';
import api from '../api/client';

interface SectionConfig {
  id: string;
  name: string;
  description: string;
  employee: boolean;
  manager: boolean;
  super_admin: boolean;
}

interface SectionMeta {
  icon: LucideIcon;
  color: string;
}

const sectionMetadata: Record<string, SectionMeta> = {
  'system-health': { icon: Activity, color: 'text-success' },
  'organization-overview': { icon: Building2, color: 'text-primary' },
  'attendance-analytics': { icon: Clock, color: 'text-info' },
  'workflow-automation': { icon: Cpu, color: 'text-success' },
  'leave-scheduling': { icon: Calendar, color: 'text-warning' },
  'ai-insights': { icon: Brain, color: 'text-secondary' },
  'alerts-notifications': { icon: Bell, color: 'text-danger' },
  'personal-time-tracking': { icon: Clock, color: 'text-primary' },
  'team-management': { icon: Users, color: 'text-info' }
};

const defaultSections: SectionConfig[] = [
  {
    id: 'system-health',
    name: 'System Health & Performance',
    description: 'System uptime, active users, pending tasks, data integrity',
    employee: false,
    manager: true,
    super_admin: true
  },
  {
    id: 'organization-overview',
    name: 'Organization Structure & User Management',
    description: 'Companies, regions, departments, user roles and statistics',
    employee: false,
    manager: true,
    super_admin: true
  },
  {
    id: 'attendance-analytics',
    name: 'Time & Attendance Analytics',
    description: 'Clock-in charts, metrics, overtime hours, exceptions',
    employee: true,
    manager: true,
    super_admin: true
  },
  {
    id: 'workflow-automation',
    name: 'Workflow & Automation Status',
    description: 'Active workflows, automation rates, payroll overview',
    employee: false,
    manager: true,
    super_admin: true
  },
  {
    id: 'leave-scheduling',
    name: 'Leave Management & Scheduling',
    description: 'Leave applications, scheduling overview, coverage rates',
    employee: true,
    manager: true,
    super_admin: true
  },
  {
    id: 'ai-insights',
    name: 'AI Insights & Reports',
    description: 'AI recommendations, productivity trends, analytics reports',
    employee: false,
    manager: true,
    super_admin: true
  },
  {
    id: 'alerts-notifications',
    name: 'System Alerts & Notifications',
    description: 'Critical alerts, system warnings, information messages',
    employee: true,
    manager: true,
    super_admin: true
  },
  {
    id: 'personal-time-tracking',
    name: 'Personal Time Tracking',
    description: 'Individual clock-in/out, personal schedule, timecard status',
    employee: true,
    manager: false,
    super_admin: false
  },
  {
    id: 'team-management',
    name: 'Team Management',
    description: 'Team member status, pending approvals, team performance',
    employee: false,
    manager: true,
    super_admin: true
  }
];

export default function DashboardConfiguration() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await api.get('/dashboard/config');
      if (response.data && response.data.sections) {
        setSections(response.data.sections);
      }
    } catch (error) {
      console.log('No existing configuration found, using defaults');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (sectionId: string, role: 'employee' | 'manager' | 'super_admin') => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, [role]: !section[role] }
        : section
    ));
  };

  const handleSave = async () => {
    try {
      await api.post('/dashboard/config', { sections });
      alert('Dashboard configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration');
    }
  };

  const handleReset = () => {
    if (confirm('Reset all dashboard settings to defaults?')) {
      setSections(defaultSections);
    }
  };

  const getEnabledSections = (role: 'employee' | 'manager' | 'super_admin') => {
    return sections
      .filter(section => section[role])
      .map(section => section.name);
  };

  const getIconForSection = (sectionId: string) => {
    return sectionMetadata[sectionId]?.icon || Activity;
  };

  const getColorForSection = (sectionId: string) => {
    return sectionMetadata[sectionId]?.color || 'text-secondary';
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <Sliders size={28} className="me-2" style={{ color: '#28468D' }} />
            Dashboard Configuration
          </h2>
          <p className="text-muted mb-0">
            Configure which dashboard sections are visible for each user role
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="success" 
            onClick={handleSave}
          >
            <Save size={18} className="me-2" />
            Save Configuration
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={handleReset}
          >
            <RefreshCw size={18} className="me-2" />
            Reset to Defaults
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/')}
            style={{ borderColor: '#28468D', color: '#28468D' }}
          >
            <ArrowLeft size={18} className="me-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Role Overview */}
      <div className="row mb-4">
        <div className="col-md-4">
          <Card className="border-primary">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">
                <User size={18} className="me-2" />
                Employee Dashboard
              </h6>
            </Card.Header>
            <Card.Body>
              <small className="text-muted">
                Standard user access focused on personal time tracking, schedules, and leave requests.
              </small>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="border-info">
            <Card.Header className="bg-info text-white">
              <h6 className="mb-0">
                <Users size={18} className="me-2" />
                Manager Dashboard
              </h6>
            </Card.Header>
            <Card.Body>
              <small className="text-muted">
                Team management features including approval workflows, team analytics, and scheduling tools.
              </small>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="border-warning">
            <Card.Header className="bg-warning text-white">
              <h6 className="mb-0">
                <Shield size={18} className="me-2" />
                Super Admin Dashboard
              </h6>
            </Card.Header>
            <Card.Body>
              <small className="text-muted">
                Complete system access with organization management, system health, and configuration controls.
              </small>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Dashboard Sections Configuration */}
      <Card className="mb-4">
        <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
          <h5 className="mb-0">
            <Activity size={20} className="me-2" />
            Dashboard Sections Configuration
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Dashboard Section</th>
                  <th className="text-center" style={{ width: '20%' }}>
                    <User size={16} className="me-1" />
                    Employee
                  </th>
                  <th className="text-center" style={{ width: '20%' }}>
                    <Users size={16} className="me-1" />
                    Manager
                  </th>
                  <th className="text-center" style={{ width: '20%' }}>
                    <Shield size={16} className="me-1" />
                    Super Admin
                  </th>
                </tr>
              </thead>
              <tbody>
                {sections.map(section => {
                  const Icon = getIconForSection(section.id);
                  const color = getColorForSection(section.id);
                  return (
                    <tr key={section.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Icon size={20} className={`me-2 ${color}`} />
                          <div>
                            <strong>{section.name}</strong>
                            <br />
                            <small className="text-muted">{section.description}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="form-check form-switch d-flex justify-content-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={section.employee}
                            onChange={() => handleToggle(section.id, 'employee')}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="form-check form-switch d-flex justify-content-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={section.manager}
                            onChange={() => handleToggle(section.id, 'manager')}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="form-check form-switch d-flex justify-content-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={section.super_admin}
                            onChange={() => handleToggle(section.id, 'super_admin')}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Dashboard Preview */}
      <Card>
        <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
          <h5 className="mb-0">
            <Eye size={20} className="me-2" />
            Dashboard Preview
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-4">
              <h6>Employee Dashboard Preview</h6>
              <div className="border rounded p-3 bg-light">
                {getEnabledSections('employee').length > 0 ? (
                  getEnabledSections('employee').map(section => (
                    <Badge 
                      key={section} 
                      bg="primary" 
                      className="me-1 mb-1"
                      style={{ backgroundColor: '#28468D' }}
                    >
                      {section}
                    </Badge>
                  ))
                ) : (
                  <small className="text-muted">Select sections above to see preview</small>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <h6>Manager Dashboard Preview</h6>
              <div className="border rounded p-3 bg-light">
                {getEnabledSections('manager').length > 0 ? (
                  getEnabledSections('manager').map(section => (
                    <Badge 
                      key={section} 
                      bg="primary" 
                      className="me-1 mb-1"
                      style={{ backgroundColor: '#28468D' }}
                    >
                      {section}
                    </Badge>
                  ))
                ) : (
                  <small className="text-muted">Select sections above to see preview</small>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <h6>Super Admin Dashboard Preview</h6>
              <div className="border rounded p-3 bg-light">
                {getEnabledSections('super_admin').length > 0 ? (
                  getEnabledSections('super_admin').map(section => (
                    <Badge 
                      key={section} 
                      bg="primary" 
                      className="me-1 mb-1"
                      style={{ backgroundColor: '#28468D' }}
                    >
                      {section}
                    </Badge>
                  ))
                ) : (
                  <small className="text-muted">Select sections above to see preview</small>
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
