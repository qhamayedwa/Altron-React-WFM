import { Card, Badge, Button, ListGroup } from 'react-bootstrap';
import { Bell, Check, Trash2 } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Bell size={28} className="me-2" />
          Notifications
        </h2>
        <Button variant="outline-secondary" size="sm">
          <Check size={16} className="me-2" />
          Mark All as Read
        </Button>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Recent Notifications</h5>
        </Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item className="d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
              <div className="fw-bold">Leave Request Approved</div>
              <small className="text-muted">Your annual leave request for Dec 25-29 has been approved.</small>
              <br />
              <small className="text-muted">2 hours ago</small>
            </div>
            <div>
              <Badge bg="success" className="me-2">New</Badge>
              <Button variant="outline-danger" size="sm">
                <Trash2 size={14} />
              </Button>
            </div>
          </ListGroup.Item>
          
          <ListGroup.Item>
            <div className="text-center text-muted py-4">
              <Bell size={48} className="text-muted mb-3" />
              <h5>No More Notifications</h5>
              <p className="text-muted">You're all caught up!</p>
            </div>
          </ListGroup.Item>
        </ListGroup>
      </Card>
    </div>
  );
}
