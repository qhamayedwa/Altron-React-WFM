import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <Alert variant="warning">
        <Alert.Heading>Access Denied</Alert.Heading>
        <p>
          You do not have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <hr />
        <div className="d-flex gap-2">
          <Button onClick={() => navigate(-1)} variant="outline-warning">
            Go Back
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="outline-warning">
            Go to Dashboard
          </Button>
        </div>
      </Alert>
    </Container>
  );
};
