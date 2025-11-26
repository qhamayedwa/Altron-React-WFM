import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
import { Globe, Languages, Clock, DollarSign, Calendar, Check, Settings } from 'lucide-react';
import api from '../api/client';

interface LocaleSettings {
  defaultLanguage: string;
  supportedLanguages: string[];
  defaultTimezone: string;
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  firstDayOfWeek: number;
  rtlSupport: boolean;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  translations: number;
  rtl: boolean;
}

const availableLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', enabled: true, translations: 100, rtl: false },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', enabled: true, translations: 95, rtl: false },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', enabled: false, translations: 80, rtl: false },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', enabled: false, translations: 75, rtl: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', enabled: false, translations: 90, rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', enabled: false, translations: 92, rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', enabled: false, translations: 70, rtl: true }
];

const timezones = [
  { value: 'Africa/Johannesburg', label: 'South Africa Standard Time (SAST)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' }
];

const currencies = [
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' }
];

export default function InternationalisationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [languages, setLanguages] = useState<Language[]>(availableLanguages);
  
  const [settings, setSettings] = useState<LocaleSettings>({
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'af'],
    defaultTimezone: 'Africa/Johannesburg',
    defaultCurrency: 'ZAR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberFormat: 'space',
    firstDayOfWeek: 1,
    rtlSupport: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organization/locale-settings');
      if (response.data.settings) {
        setSettings(response.data.settings);
      }
      if (response.data.languages) {
        setLanguages(response.data.languages);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await api.put('/organization/locale-settings', { settings, languages });
      setSuccess('Settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = (code: string) => {
    setLanguages(languages.map(lang => 
      lang.code === code ? { ...lang, enabled: !lang.enabled } : lang
    ));
  };

  const getPreviewDate = () => {
    const date = new Date();
    switch (settings.dateFormat) {
      case 'DD/MM/YYYY': return date.toLocaleDateString('en-GB');
      case 'MM/DD/YYYY': return date.toLocaleDateString('en-US');
      case 'YYYY-MM-DD': return date.toISOString().split('T')[0];
      default: return date.toLocaleDateString();
    }
  };

  const getPreviewTime = () => {
    const date = new Date();
    return settings.timeFormat === '24h' 
      ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getPreviewNumber = () => {
    const num = 1234567.89;
    switch (settings.numberFormat) {
      case 'comma': return num.toLocaleString('en-US');
      case 'space': return num.toLocaleString('fr-FR');
      case 'period': return num.toLocaleString('de-DE');
      default: return num.toString();
    }
  };

  const getCurrencySymbol = () => {
    return currencies.find(c => c.code === settings.defaultCurrency)?.symbol || settings.defaultCurrency;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading settings...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 d-flex align-items-center gap-2">
            <Globe className="text-primary" /> Internationalisation Settings
          </h2>
          <p className="text-muted mb-0">Configure languages, timezones, and regional formats</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner animation="border" size="sm" className="me-1" /> : <Check size={18} className="me-1" />}
          Save Settings
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Languages size={32} className="text-primary mb-2" />
              <h3>{languages.filter(l => l.enabled).length}</h3>
              <small className="text-muted">Active Languages</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Clock size={32} className="text-info mb-2" />
              <h5 className="mb-1">{settings.defaultTimezone.split('/')[1]}</h5>
              <small className="text-muted">Default Timezone</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <DollarSign size={32} className="text-success mb-2" />
              <h3>{getCurrencySymbol()}</h3>
              <small className="text-muted">{settings.defaultCurrency}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Calendar size={32} className="text-warning mb-2" />
              <h5 className="mb-1">{getPreviewDate()}</h5>
              <small className="text-muted">{getPreviewTime()}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'general')}>
            <Tab eventKey="general" title="General" />
            <Tab eventKey="languages" title="Languages" />
            <Tab eventKey="formats" title="Date & Number Formats" />
            <Tab eventKey="preview" title="Preview" />
          </Tabs>
        </Card.Header>
        <Card.Body>
          {activeTab === 'general' && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Default Language</Form.Label>
                  <Form.Select
                    value={settings.defaultLanguage}
                    onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                  >
                    {languages.filter(l => l.enabled).map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name} ({lang.nativeName})</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Default Timezone</Form.Label>
                  <Form.Select
                    value={settings.defaultTimezone}
                    onChange={(e) => setSettings({ ...settings, defaultTimezone: e.target.value })}
                  >
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Default Currency</Form.Label>
                  <Form.Select
                    value={settings.defaultCurrency}
                    onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                  >
                    {currencies.map(curr => (
                      <option key={curr.code} value={curr.code}>{curr.symbol} - {curr.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Day of Week</Form.Label>
                  <Form.Select
                    value={settings.firstDayOfWeek}
                    onChange={(e) => setSettings({ ...settings, firstDayOfWeek: parseInt(e.target.value) })}
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={6}>Saturday</option>
                  </Form.Select>
                </Form.Group>

                <Form.Check
                  type="switch"
                  id="rtlSupport"
                  label="Enable RTL (Right-to-Left) Support"
                  checked={settings.rtlSupport}
                  onChange={(e) => setSettings({ ...settings, rtlSupport: e.target.checked })}
                  className="mb-3"
                />
                <small className="text-muted">
                  Enable this for languages like Arabic and Hebrew that read right-to-left.
                </small>
              </Col>
            </Row>
          )}

          {activeTab === 'languages' && (
            <Table responsive hover>
              <thead className="bg-light">
                <tr>
                  <th>Language</th>
                  <th>Native Name</th>
                  <th>Translation Progress</th>
                  <th>RTL</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {languages.map(lang => (
                  <tr key={lang.code}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-medium">{lang.name}</span>
                        <Badge bg="light" text="dark" className="font-monospace">{lang.code}</Badge>
                      </div>
                    </td>
                    <td>{lang.nativeName}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: 8 }}>
                          <div 
                            className={`progress-bar ${lang.translations >= 90 ? 'bg-success' : lang.translations >= 70 ? 'bg-warning' : 'bg-danger'}`}
                            style={{ width: `${lang.translations}%` }}
                          />
                        </div>
                        <small>{lang.translations}%</small>
                      </div>
                    </td>
                    <td>
                      {lang.rtl && <Badge bg="info">RTL</Badge>}
                    </td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={lang.enabled}
                        onChange={() => toggleLanguage(lang.code)}
                        label={lang.enabled ? 'Enabled' : 'Disabled'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {activeTab === 'formats' && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date Format</Form.Label>
                  <Form.Select
                    value={settings.dateFormat}
                    onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (26/11/2025)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (11/26/2025)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2025-11-26)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Time Format</Form.Label>
                  <Form.Select
                    value={settings.timeFormat}
                    onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                  >
                    <option value="24h">24-hour (14:30)</option>
                    <option value="12h">12-hour (2:30 PM)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Number Format</Form.Label>
                  <Form.Select
                    value={settings.numberFormat}
                    onChange={(e) => setSettings({ ...settings, numberFormat: e.target.value })}
                  >
                    <option value="space">1 234 567,89 (Space separator)</option>
                    <option value="comma">1,234,567.89 (Comma separator)</option>
                    <option value="period">1.234.567,89 (Period separator)</option>
                  </Form.Select>
                </Form.Group>

                <div className="p-3 bg-light rounded mt-4">
                  <h6>Format Preview</h6>
                  <div className="small">
                    <div><strong>Date:</strong> {getPreviewDate()}</div>
                    <div><strong>Time:</strong> {getPreviewTime()}</div>
                    <div><strong>Number:</strong> {getPreviewNumber()}</div>
                    <div><strong>Currency:</strong> {getCurrencySymbol()} {getPreviewNumber()}</div>
                  </div>
                </div>
              </Col>
            </Row>
          )}

          {activeTab === 'preview' && (
            <div className="p-4 bg-light rounded">
              <h5 className="mb-4">Sample Application Preview</h5>
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h6>Employee Dashboard</h6>
                      <p className="mb-1"><strong>Today's Date:</strong> {getPreviewDate()}</p>
                      <p className="mb-1"><strong>Current Time:</strong> {getPreviewTime()}</p>
                      <p className="mb-1"><strong>Hours Worked:</strong> 7.50</p>
                      <p className="mb-0"><strong>Salary:</strong> {getCurrencySymbol()} {getPreviewNumber()}</p>
                    </Col>
                    <Col md={6}>
                      <h6>Regional Settings</h6>
                      <p className="mb-1"><strong>Language:</strong> {languages.find(l => l.code === settings.defaultLanguage)?.name}</p>
                      <p className="mb-1"><strong>Timezone:</strong> {settings.defaultTimezone}</p>
                      <p className="mb-1"><strong>Currency:</strong> {settings.defaultCurrency}</p>
                      <p className="mb-0"><strong>Week Starts:</strong> {settings.firstDayOfWeek === 0 ? 'Sunday' : settings.firstDayOfWeek === 1 ? 'Monday' : 'Saturday'}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
