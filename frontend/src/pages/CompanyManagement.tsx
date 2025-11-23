import { useState, useEffect } from 'react';
import { Card, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Eye, Edit } from 'lucide-react';
import api from '../api/client';

interface Company {
  id: number;
  name: string;
  code: string;
  legalName?: string;
  city?: string;
  country?: string;
  regionCount: number;
}

export default function CompanyManagement() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await api.get('/organization/companies');
      setCompanies(response.data.companies || []);
    } catch (err) {
      console.error('Error loading companies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Building2 size={28} className="me-2" />
          Company Management
        </h2>
        <Button
          variant="primary"
          onClick={() => navigate('/organization/companies/create')}
        >
          <Plus size={18} className="me-2" />
          Create Company
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <Building2 size={20} className="me-2" />
            Companies
          </h5>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : companies.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No companies configured yet.</p>
              <Button variant="primary" onClick={() => navigate('/organization/companies/create')}>
                <Plus size={18} className="me-2" />
                Create First Company
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Code</th>
                    <th>Legal Name</th>
                    <th>Location</th>
                    <th>Regions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td>
                        <strong>{company.name}</strong>
                      </td>
                      <td>
                        <Badge bg="secondary">{company.code}</Badge>
                      </td>
                      <td>{company.legalName || '-'}</td>
                      <td>{company.city ? `${company.city}, ${company.country}` : company.country || '-'}</td>
                      <td>
                        <Badge bg="info">{company.regionCount}</Badge>
                      </td>
                      <td>
                        <div className="btn-group">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/organization/companies/view/${company.id}`)}
                          >
                            <Eye size={16} className="me-1" />
                            View
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => navigate(`/organization/companies/edit/${company.id}`)}
                          >
                            <Edit size={16} className="me-1" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
