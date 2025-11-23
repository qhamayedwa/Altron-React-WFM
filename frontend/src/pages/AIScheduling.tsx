import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Cpu, History, BarChart2, Zap, Calendar } from 'lucide-react';

const AIScheduling: React.FC = () => {
  return (
    <Container className="py-4">
        <div className="mb-4">
          <h1 className="h2">
            <Cpu className="me-2" size={32} style={{ verticalAlign: 'middle' }} />
            AI Scheduling Optimization
          </h1>
          <p className="text-muted">AI-powered schedule optimization and intelligent recommendations</p>
        </div>

        <Row>
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex align-items-start mb-3">
                  <div className="bg-primary text-white rounded p-3 me-3">
                    <Zap size={32} />
                  </div>
                  <div>
                    <h5>Generate AI Schedule</h5>
                    <p className="text-muted small mb-0">
                      Create optimized schedules using AI algorithms based on employee availability, 
                      skills, preferences, and business requirements.
                    </p>
                  </div>
                </div>
                <Button variant="primary" className="w-100">
                  <Zap className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                  Generate New Schedule
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex align-items-start mb-3">
                  <div className="bg-info text-white rounded p-3 me-3">
                    <History size={32} />
                  </div>
                  <div>
                    <h5>View Generation History</h5>
                    <p className="text-muted small mb-0">
                      Review past AI-generated schedules, performance metrics, optimization scores, 
                      and coverage analysis.
                    </p>
                  </div>
                </div>
                <Link to="/ai-scheduling/history" className="btn btn-info w-100">
                  <History className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                  View History
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-4">
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <BarChart2 className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
                  Features
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4} className="mb-3">
                    <div className="border-start border-primary border-4 ps-3">
                      <h6>Smart Optimization</h6>
                      <p className="text-muted small">
                        AI algorithms analyze employee skills, availability, preferences, and labor costs 
                        to create optimal schedules.
                      </p>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="border-start border-success border-4 ps-3">
                      <h6>Coverage Analysis</h6>
                      <p className="text-muted small">
                        Ensure adequate staffing levels across all time slots and departments based on 
                        historical demand patterns.
                      </p>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="border-start border-warning border-4 ps-3">
                      <h6>Conflict Detection</h6>
                      <p className="text-muted small">
                        Automatically identify and resolve scheduling conflicts, time-off requests, 
                        and compliance violations.
                      </p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <Calendar className="me-2" size={20} style={{ verticalAlign: 'middle' }} />
                  Quick Access
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex gap-2 flex-wrap">
                  <Link to="/ai-scheduling/history" className="btn btn-outline-primary">
                    <History className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                    View All Generated Schedules
                  </Link>
                  <Link to="/manage-schedules" className="btn btn-outline-secondary">
                    <Calendar className="me-2" size={18} style={{ verticalAlign: 'middle' }} />
                    Manage Current Schedules
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
  );
};

export default AIScheduling;
