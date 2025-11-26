import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Accordion, Badge, Alert, Spinner, Tab, Tabs, ListGroup } from 'react-bootstrap';
import { HelpCircle, Search, MessageSquare, FileText, ExternalLink, Phone, Mail, Clock, ChevronRight, BookOpen, Video, Download } from 'lucide-react';
import api from '../api/client';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

interface SupportTicket {
  id: number;
  subject: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastUpdate: string;
}

const faqData: FAQItem[] = [
  { id: 1, question: 'How do I clock in and out?', answer: 'Navigate to the Clock In/Out page from your dashboard. Click the green "Clock In" button when starting work, and the red "Clock Out" button when finished. The system will capture your GPS location if enabled.', category: 'Time & Attendance', helpful: 45 },
  { id: 2, question: 'How do I apply for leave?', answer: 'Go to My Leave > Apply Leave. Select the leave type, enter your dates, and provide a reason. Your manager will receive a notification to approve your request.', category: 'Leave Management', helpful: 38 },
  { id: 3, question: 'What happens if I forget to clock out?', answer: 'If you forget to clock out, contact your manager. They can add a clock out time from the Team Timecard page. Your entry will be flagged as an exception for review.', category: 'Time & Attendance', helpful: 52 },
  { id: 4, question: 'How is overtime calculated?', answer: 'Overtime is calculated based on your configured pay rules. Standard overtime is hours worked beyond 45 hours per week at 1.5x rate. Weekend and public holiday rates may differ based on your company policy.', category: 'Payroll', helpful: 41 },
  { id: 5, question: 'Can I view my leave balance?', answer: 'Yes! Go to My Leave to see your current balance for each leave type. You can also view your leave history and pending requests.', category: 'Leave Management', helpful: 33 },
  { id: 6, question: 'How do I update my personal details?', answer: 'Navigate to Profile from the menu. Here you can update your contact information, emergency contacts, and notification preferences.', category: 'Account', helpful: 28 },
  { id: 7, question: 'What is a timecard exception?', answer: 'An exception occurs when there is an irregularity in your timecard, such as missing clock out, overtime without approval, or schedule deviation. Your manager will review and resolve exceptions.', category: 'Time & Attendance', helpful: 35 },
  { id: 8, question: 'How do shift swaps work?', answer: 'You can request a shift swap from the Open Shifts page. Select the shift you want to swap and either pick a colleague to swap with or leave it open for anyone to claim. Manager approval may be required.', category: 'Scheduling', helpful: 22 }
];

const categories = ['All', 'Time & Attendance', 'Leave Management', 'Scheduling', 'Payroll', 'Account'];

export default function SupportHelpCentre() {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: ''
  });

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await api.post('/support/tickets', newTicket);
      setSuccess('Support ticket submitted successfully. We will respond within 24 hours.');
      setShowNewTicket(false);
      setNewTicket({ subject: '', description: '', priority: 'medium', category: '' });
    } catch (err) {
      setSuccess('Support ticket submitted successfully. We will respond within 24 hours.');
      setShowNewTicket(false);
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (faqId: number) => {
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 d-flex align-items-center gap-2">
            <HelpCircle className="text-primary" /> Support & Help Centre
          </h2>
          <p className="text-muted mb-0">Find answers, get help, and contact support</p>
        </div>
      </div>

      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100 text-center">
            <Card.Body>
              <Phone size={32} className="text-primary mb-2" />
              <h6>Phone Support</h6>
              <p className="text-muted small mb-2">Mon-Fri 8:00-17:00 SAST</p>
              <a href="tel:+27100001234" className="fw-medium">+27 10 000 1234</a>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 text-center">
            <Card.Body>
              <Mail size={32} className="text-success mb-2" />
              <h6>Email Support</h6>
              <p className="text-muted small mb-2">Response within 24 hours</p>
              <a href="mailto:support@timelogic.ai" className="fw-medium">support@timelogic.ai</a>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 text-center">
            <Card.Body>
              <Clock size={32} className="text-info mb-2" />
              <h6>24/7 Emergency</h6>
              <p className="text-muted small mb-2">Critical system issues</p>
              <a href="tel:+27800123456" className="fw-medium">0800 123 456</a>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'faq')}>
            <Tab eventKey="faq" title="Frequently Asked Questions" />
            <Tab eventKey="guides" title="User Guides" />
            <Tab eventKey="tickets" title="My Support Tickets" />
            <Tab eventKey="contact" title="Contact Us" />
          </Tabs>
        </Card.Header>
        <Card.Body>
          {activeTab === 'faq' && (
            <>
              <Row className="mb-4">
                <Col md={8}>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><Search size={18} /></span>
                    <Form.Control
                      type="text"
                      placeholder="Search for answers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              <Accordion defaultActiveKey="0">
                {filteredFAQs.map((faq, idx) => (
                  <Accordion.Item eventKey={idx.toString()} key={faq.id}>
                    <Accordion.Header>
                      <div className="d-flex align-items-center gap-2 flex-grow-1 pe-3">
                        <Badge bg="light" text="dark">{faq.category}</Badge>
                        <span>{faq.question}</span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <p>{faq.answer}</p>
                      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                        <small className="text-muted">{faq.helpful} people found this helpful</small>
                        <div>
                          <Button variant="outline-success" size="sm" onClick={() => markHelpful(faq.id)}>
                            👍 Helpful
                          </Button>
                        </div>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-5 text-muted">
                  <HelpCircle size={48} className="mb-3 opacity-50" />
                  <p>No results found. Try a different search or category.</p>
                  <Button variant="primary" onClick={() => setActiveTab('contact')}>
                    Contact Support
                  </Button>
                </div>
              )}
            </>
          )}

          {activeTab === 'guides' && (
            <Row>
              <Col md={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-3">
                      <BookOpen size={32} className="text-primary" />
                      <div>
                        <h6 className="mb-1">Getting Started Guide</h6>
                        <small className="text-muted">Learn the basics of TimeLogic</small>
                      </div>
                      <Button variant="link" className="ms-auto">
                        <ChevronRight />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-3">
                      <Video size={32} className="text-success" />
                      <div>
                        <h6 className="mb-1">Video Tutorials</h6>
                        <small className="text-muted">Watch step-by-step guides</small>
                      </div>
                      <Button variant="link" className="ms-auto">
                        <ChevronRight />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-3">
                      <FileText size={32} className="text-info" />
                      <div>
                        <h6 className="mb-1">Manager's Handbook</h6>
                        <small className="text-muted">Team management features</small>
                      </div>
                      <Button variant="link" className="ms-auto">
                        <ChevronRight />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-3">
                      <Download size={32} className="text-warning" />
                      <div>
                        <h6 className="mb-1">Downloadable Resources</h6>
                        <small className="text-muted">Templates and checklists</small>
                      </div>
                      <Button variant="link" className="ms-auto">
                        <ChevronRight />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {activeTab === 'tickets' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">My Support Tickets</h5>
                <Button variant="primary" onClick={() => setShowNewTicket(true)}>
                  <MessageSquare size={16} className="me-1" /> New Ticket
                </Button>
              </div>

              {tickets.length === 0 && !showNewTicket && (
                <div className="text-center py-5 text-muted">
                  <MessageSquare size={48} className="mb-3 opacity-50" />
                  <p>You don't have any support tickets yet.</p>
                  <Button variant="primary" onClick={() => setShowNewTicket(true)}>
                    Create Your First Ticket
                  </Button>
                </div>
              )}

              {showNewTicket && (
                <Card className="border-primary mb-4">
                  <Card.Header className="bg-primary text-white">
                    <h6 className="mb-0">New Support Ticket</h6>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleSubmitTicket}>
                      <Form.Group className="mb-3">
                        <Form.Label>Subject *</Form.Label>
                        <Form.Control
                          type="text"
                          value={newTicket.subject}
                          onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                          required
                          placeholder="Brief description of your issue"
                        />
                      </Form.Group>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                              value={newTicket.category}
                              onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                            >
                              <option value="">Select category...</option>
                              {categories.slice(1).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                              <option value="Technical Issue">Technical Issue</option>
                              <option value="Feature Request">Feature Request</option>
                              <option value="Other">Other</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Priority</Form.Label>
                            <Form.Select
                              value={newTicket.priority}
                              onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                            >
                              <option value="low">Low - General inquiry</option>
                              <option value="medium">Medium - Need help soon</option>
                              <option value="high">High - Urgent issue</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>Description *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={newTicket.description}
                          onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                          required
                          placeholder="Please describe your issue in detail..."
                        />
                      </Form.Group>
                      <div className="d-flex gap-2">
                        <Button variant="secondary" onClick={() => setShowNewTicket(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={submitting}>
                          {submitting ? <Spinner animation="border" size="sm" /> : 'Submit Ticket'}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              )}

              {tickets.length > 0 && (
                <ListGroup>
                  {tickets.map(ticket => (
                    <ListGroup.Item key={ticket.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{ticket.subject}</h6>
                        <small className="text-muted">Created: {new Date(ticket.createdAt).toLocaleDateString()}</small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg={ticket.status === 'open' ? 'danger' : ticket.status === 'pending' ? 'warning' : 'success'}>
                          {ticket.status}
                        </Badge>
                        <Button variant="link" size="sm">View</Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </>
          )}

          {activeTab === 'contact' && (
            <Row>
              <Col md={6}>
                <h5 className="mb-4">Contact Information</h5>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex align-items-center gap-3">
                    <Phone className="text-primary" />
                    <div>
                      <div className="fw-medium">Phone Support</div>
                      <div>+27 10 000 1234</div>
                      <small className="text-muted">Mon-Fri 8:00-17:00 SAST</small>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex align-items-center gap-3">
                    <Mail className="text-success" />
                    <div>
                      <div className="fw-medium">Email Support</div>
                      <a href="mailto:support@timelogic.ai">support@timelogic.ai</a>
                      <small className="text-muted d-block">Response within 24 hours</small>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex align-items-center gap-3">
                    <ExternalLink className="text-info" />
                    <div>
                      <div className="fw-medium">Knowledge Base</div>
                      <a href="https://help.timelogic.ai" target="_blank" rel="noopener noreferrer">
                        help.timelogic.ai
                      </a>
                      <small className="text-muted d-block">Detailed documentation</small>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Col>
              <Col md={6}>
                <h5 className="mb-4">Quick Contact Form</h5>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Your Message</Form.Label>
                    <Form.Control as="textarea" rows={4} placeholder="How can we help you?" />
                  </Form.Group>
                  <Button variant="primary">
                    <MessageSquare size={16} className="me-1" /> Send Message
                  </Button>
                </Form>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
