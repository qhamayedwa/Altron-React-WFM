import { useState } from 'react';
import Layout from '../components/Layout';

interface DataSource {
  name: string;
  fields: string[];
}

const dataSources: Record<string, DataSource> = {
  time_entries: {
    name: 'Time Entries',
    fields: ['Employee Name', 'Clock In', 'Clock Out', 'Total Hours', 'Status', 'Pay Code']
  },
  leave_applications: {
    name: 'Leave Applications',
    fields: ['Employee Name', 'Leave Type', 'Start Date', 'End Date', 'Status', 'Days Requested']
  },
  schedules: {
    name: 'Schedules',
    fields: ['Employee Name', 'Date', 'Shift Type', 'Start Time', 'End Time', 'Location']
  },
  payroll: {
    name: 'Payroll Data',
    fields: ['Employee Name', 'Regular Hours', 'OT Hours', 'Pay Rate', 'Total Pay', 'Pay Period']
  }
};

const reportFormats = ['Excel (XLSX)', 'CSV', 'PDF', 'JSON'];

export default function CustomReportBuilder() {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<Record<string, string[]>>({});
  const [reportName, setReportName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState('Excel (XLSX)');
  const [filters, setFilters] = useState('');
  const [preview, setPreview] = useState('');

  useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  });

  const handleSourceToggle = (sourceKey: string) => {
    if (selectedSources.includes(sourceKey)) {
      setSelectedSources(selectedSources.filter(s => s !== sourceKey));
      const newFields = { ...selectedFields };
      delete newFields[sourceKey];
      setSelectedFields(newFields);
    } else {
      setSelectedSources([...selectedSources, sourceKey]);
    }
  };

  const handleFieldToggle = (sourceKey: string, field: string) => {
    const currentFields = selectedFields[sourceKey] || [];
    if (currentFields.includes(field)) {
      setSelectedFields({
        ...selectedFields,
        [sourceKey]: currentFields.filter(f => f !== field)
      });
    } else {
      setSelectedFields({
        ...selectedFields,
        [sourceKey]: [...currentFields, field]
      });
    }
  };

  const handlePreview = () => {
    if (selectedSources.length === 0) {
      alert('Please select at least one data source.');
      return;
    }

    let previewHtml = '<h6>Report Preview</h6>';
    previewHtml += '<div class="table-responsive">';
    previewHtml += '<table class="table table-sm table-bordered">';
    previewHtml += '<thead><tr>';

    selectedSources.forEach(source => {
      const fields = selectedFields[source] || dataSources[source].fields;
      fields.forEach(field => {
        previewHtml += `<th>${field}</th>`;
      });
    });

    previewHtml += '</tr></thead>';
    previewHtml += '<tbody>';
    previewHtml += '<tr><td colspan="100" class="text-center text-muted">Sample data will appear here</td></tr>';
    previewHtml += '</tbody></table></div>';

    setPreview(previewHtml);
  };

  const handleGenerate = () => {
    if (!reportName.trim()) {
      alert('Please enter a report name.');
      return;
    }

    if (selectedSources.length === 0) {
      alert('Please select at least one data source.');
      return;
    }

    alert(`Custom report "${reportName}" would be generated with sources: ${selectedSources.join(', ')}\n\nThis feature requires backend implementation for dynamic query building and data export.`);
  };

  const handleSaveTemplate = () => {
    if (!reportName.trim()) {
      alert('Please enter a report name to save as template.');
      return;
    }

    alert(`Report template "${reportName}" would be saved for future use.\n\nThis feature requires backend implementation for template storage and retrieval.`);
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3 mb-0">Custom Report Builder</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item"><a href="/payroll">Payroll</a></li>
                  <li className="breadcrumb-item active">Custom Builder</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-database me-2"></i>Data Sources
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted">Select the data sources you want to include in your custom report.</p>

                {Object.entries(dataSources).map(([sourceKey, sourceInfo]) => (
                  <div key={sourceKey} className="card border-secondary mb-3">
                    <div className="card-header">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`source_${sourceKey}`}
                          checked={selectedSources.includes(sourceKey)}
                          onChange={() => handleSourceToggle(sourceKey)}
                        />
                        <label className="form-check-label fw-bold" htmlFor={`source_${sourceKey}`}>
                          {sourceInfo.name}
                        </label>
                      </div>
                    </div>
                    <div className="card-body py-2">
                      <p className="text-muted mb-2">Available fields:</p>
                      <div className="row">
                        {sourceInfo.fields.map((field) => (
                          <div key={field} className="col-md-6">
                            <div className="form-check form-check-sm">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`field_${sourceKey}_${field}`}
                                checked={selectedFields[sourceKey]?.includes(field) || false}
                                disabled={!selectedSources.includes(sourceKey)}
                                onChange={() => handleFieldToggle(sourceKey, field)}
                              />
                              <label className="form-check-label small" htmlFor={`field_${sourceKey}_${field}`}>
                                {field}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-gear me-2"></i>Report Configuration
                </h5>
              </div>
              <div className="card-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="reportName" className="form-label">Report Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="reportName"
                      placeholder="Enter custom report name"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Date Range</label>
                    <div className="row">
                      <div className="col-6">
                        <input
                          type="date"
                          className="form-control"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="date"
                          className="form-control"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="reportFormat" className="form-label">Export Format</label>
                    <select
                      className="form-select"
                      id="reportFormat"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                    >
                      {reportFormats.map((fmt) => (
                        <option key={fmt} value={fmt}>{fmt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="filters" className="form-label">Filters (Optional)</label>
                    <textarea
                      className="form-control"
                      id="filters"
                      rows={3}
                      placeholder="Enter filter conditions (e.g., department=HR, status=active)"
                      value={filters}
                      onChange={(e) => setFilters(e.target.value)}
                    ></textarea>
                    <div className="form-text">Enter one filter per line in format: field=value</div>
                  </div>
                </form>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-eye me-2"></i>Report Preview
                </h5>
              </div>
              <div className="card-body">
                {preview ? (
                  <div dangerouslySetInnerHTML={{ __html: preview }} />
                ) : (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-file-text" style={{ fontSize: '48px' }}></i>
                    <p className="mt-3">Select data sources and configure your report to see a preview.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Ready to Generate Your Custom Report?</h6>
                    <p className="text-muted mb-0">Configure your data sources and settings above, then generate your report.</p>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-secondary" onClick={handlePreview}>
                      <i className="bi bi-eye me-2"></i>Preview
                    </button>
                    <button type="button" className="btn btn-success" onClick={handleGenerate}>
                      <i className="bi bi-download me-2"></i>Generate Report
                    </button>
                    <button type="button" className="btn btn-outline-primary" onClick={handleSaveTemplate}>
                      <i className="bi bi-save me-2"></i>Save Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-info">
              <h6 className="alert-heading">
                <i className="bi bi-info-circle me-2"></i>Custom Report Builder - Advanced Feature
              </h6>
              <p className="mb-0">
                This custom report builder provides a foundation for creating advanced, tailored reports.
                The interface allows you to select data sources, configure fields, and set export options.
                Full implementation includes dynamic query building, advanced filtering, and template saving capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
