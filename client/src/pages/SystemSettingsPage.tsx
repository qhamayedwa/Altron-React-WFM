import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Settings, Save, DollarSign, Clock, Calendar, Globe } from 'lucide-react';
import { api } from '../lib/api';

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [settings, setSettings] = useState({
    company_name: 'WFM24/7',
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR',
    date_format: 'YYYY-MM-DD',
    time_format: '24h',
    default_hourly_rate: 100,
    overtime_multiplier: 1.5,
    double_time_multiplier: 2.0,
    max_daily_hours: 12,
    min_break_duration: 30,
    geo_fence_enabled: true,
    geo_fence_radius: 100,
    auto_clock_out_hours: 12,
    leave_accrual_enabled: true,
    leave_accrual_day: 1,
    payroll_cycle: 'monthly',
    payroll_cutoff_day: 25,
    allow_retroactive_entries: false,
    retroactive_days_limit: 7,
    require_manager_approval: true,
    notification_retention_days: 90,
  });

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/organization/settings', settings);
      setSuccess('System settings updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1"><Settings className="me-2" size={28} />System Settings</h2>
          <p className="text-muted mb-0">Configure global system settings and defaults</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row className="mb-3">
        <Col>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            <Save className="me-2" size={18} />
            {loading ? 'Saving...' : 'Save All Settings'}
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0"><Globe className="me-2" size={20} />General Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Timezone</Form.Label>
                <Form.Select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                >
                  <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                  <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                  <option value="UTC">UTC</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Currency</Form.Label>
                <Form.Select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                >
                  <option value="ZAR">ZAR (South African Rand)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                </Form.Select>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date Format</Form.Label>
                    <Form.Select
                      value={settings.date_format}
                      onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Time Format</Form.Label>
                    <Form.Select
                      value={settings.time_format}
                      onChange={(e) => setSettings({ ...settings, time_format: e.target.value })}
                    >
                      <option value="24h">24-hour</option>
                      <option value="12h">12-hour (AM/PM)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0"><DollarSign className="me-2" size={20} />Payroll Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Default Hourly Rate (ZAR)</Form.Label>
                <InputGroup>
                  <InputGroup.Text>R</InputGroup.Text>
                  <Form.Control
                    type="number"
                    value={settings.default_hourly_rate}
                    onChange={(e) => setSettings({ ...settings, default_hourly_rate: parseFloat(e.target.value) })}
                    step="0.01"
                  />
                </InputGroup>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Overtime Multiplier</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.overtime_multiplier}
                      onChange={(e) => setSettings({ ...settings, overtime_multiplier: parseFloat(e.target.value) })}
                      step="0.1"
                    />
                    <Form.Text className="text-muted">e.g., 1.5 for time-and-a-half</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Double Time Multiplier</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.double_time_multiplier}
                      onChange={(e) => setSettings({ ...settings, double_time_multiplier: parseFloat(e.target.value) })}
                      step="0.1"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Payroll Cycle</Form.Label>
                <Form.Select
                  value={settings.payroll_cycle}
                  onChange={(e) => setSettings({ ...settings, payroll_cycle: e.target.value })}
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payroll Cutoff Day</Form.Label>
                <Form.Control
                  type="number"
                  value={settings.payroll_cutoff_day}
                  onChange={(e) => setSettings({ ...settings, payroll_cutoff_day: parseInt(e.target.value) })}
                  min={1}
                  max={31}
                />
                <Form.Text className="text-muted">Day of month when payroll period ends</Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0"><Clock className="me-2" size={20} />Time Tracking Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Maximum Daily Hours</Form.Label>
                <Form.Control
                  type="number"
                  value={settings.max_daily_hours}
                  onChange={(e) => setSettings({ ...settings, max_daily_hours: parseInt(e.target.value) })}
                  min={1}
                  max={24}
                />
                <Form.Text className="text-muted">Alert if employee exceeds this</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Minimum Break Duration (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  value={settings.min_break_duration}
                  onChange={(e) => setSettings({ ...settings, min_break_duration: parseInt(e.target.value) })}
                  min={0}
                  step={15}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Auto Clock-Out After (hours)</Form.Label>
                <Form.Control
                  type="number"
                  value={settings.auto_clock_out_hours}
                  onChange={(e) => setSettings({ ...settings, auto_clock_out_hours: parseInt(e.target.value) })}
                  min={1}
                  max={24}
                />
                <Form.Text className="text-muted">Automatically clock out if forgotten</Form.Text>
              </Form.Group>

              <Form.Check
                type="checkbox"
                label="Enable GPS Geo-Fencing"
                checked={settings.geo_fence_enabled}
                onChange={(e) => setSettings({ ...settings, geo_fence_enabled: e.target.checked })}
                className="mb-3"
              />

              {settings.geo_fence_enabled && (
                <Form.Group className="mb-3">
                  <Form.Label>Geo-Fence Radius (meters)</Form.Label>
                  <Form.Control
                    type="number"
                    value={settings.geo_fence_radius}
                    onChange={(e) => setSettings({ ...settings, geo_fence_radius: parseInt(e.target.value) })}
                    min={10}
                    step={10}
                  />
                </Form.Group>
              )}

              <Form.Check
                type="checkbox"
                label="Allow Retroactive Time Entries"
                checked={settings.allow_retroactive_entries}
                onChange={(e) => setSettings({ ...settings, allow_retroactive_entries: e.target.checked })}
                className="mb-3"
              />

              {settings.allow_retroactive_entries && (
                <Form.Group className="mb-3">
                  <Form.Label>Retroactive Days Limit</Form.Label>
                  <Form.Control
                    type="number"
                    value={settings.retroactive_days_limit}
                    onChange={(e) => setSettings({ ...settings, retroactive_days_limit: parseInt(e.target.value) })}
                    min={1}
                    max={30}
                  />
                </Form.Group>
              )}

              <Form.Check
                type="checkbox"
                label="Require Manager Approval for Time Entries"
                checked={settings.require_manager_approval}
                onChange={(e) => setSettings({ ...settings, require_manager_approval: e.target.checked })}
                className="mb-3"
              />
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0"><Calendar className="me-2" size={20} />Leave Management Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form.Check
                type="checkbox"
                label="Enable Automatic Leave Accrual"
                checked={settings.leave_accrual_enabled}
                onChange={(e) => setSettings({ ...settings, leave_accrual_enabled: e.target.checked })}
                className="mb-3"
              />

              {settings.leave_accrual_enabled && (
                <Form.Group className="mb-3">
                  <Form.Label>Accrual Day (1-31)</Form.Label>
                  <Form.Control
                    type="number"
                    value={settings.leave_accrual_day}
                    onChange={(e) => setSettings({ ...settings, leave_accrual_day: parseInt(e.target.value) })}
                    min={1}
                    max={31}
                  />
                  <Form.Text className="text-muted">Day of month to run accrual</Form.Text>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Notification Retention (days)</Form.Label>
                <Form.Control
                  type="number"
                  value={settings.notification_retention_days}
                  onChange={(e) => setSettings({ ...settings, notification_retention_days: parseInt(e.target.value) })}
                  min={7}
                  max={365}
                />
                <Form.Text className="text-muted">Auto-delete old notifications after this period</Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
