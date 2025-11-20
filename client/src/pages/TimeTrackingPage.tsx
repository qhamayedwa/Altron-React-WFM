import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface TimeStatus {
  is_clocked_in: boolean;
  today_hours: number;
  entry_id?: number;
  clock_in_time?: string;
  current_duration?: number;
}

export const TimeTrackingPage: React.FC = () => {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const queryClient = useQueryClient();

  const { data: statusData, isLoading } = useQuery({
    queryKey: ['time-status'],
    queryFn: async () => {
      const response = await api.get('/time/current-status');
      return response.data.data as TimeStatus;
    },
    refetchInterval: 30000,
  });

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => console.error('Geolocation error:', error)
      );
    }
  }, []);

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {};
      if (location) {
        payload.latitude = location.coords.latitude;
        payload.longitude = location.coords.longitude;
      }
      const response = await api.post('/time/clock-in', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-status'] });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {};
      if (location) {
        payload.latitude = location.coords.latitude;
        payload.longitude = location.coords.longitude;
      }
      const response = await api.post('/time/clock-out', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-status'] });
    },
  });

  const handleClockIn = () => {
    clockInMutation.mutate();
  };

  const handleClockOut = () => {
    clockOutMutation.mutate();
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  const isClockedIn = statusData?.is_clocked_in || false;
  const todayHours = statusData?.today_hours || 0;
  const currentDuration = statusData?.current_duration || 0;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Time & Attendance</h2>

      {clockInMutation.isError && (
        <Alert variant="danger" dismissible onClose={() => clockInMutation.reset()}>
          {clockInMutation.error instanceof Error
            ? clockInMutation.error.message
            : 'Failed to clock in. Please try again.'}
        </Alert>
      )}

      {clockOutMutation.isError && (
        <Alert variant="danger" dismissible onClose={() => clockOutMutation.reset()}>
          {clockOutMutation.error instanceof Error
            ? clockOutMutation.error.message
            : 'Failed to clock out. Please try again.'}
        </Alert>
      )}

      {clockInMutation.isSuccess && (
        <Alert variant="success" dismissible onClose={() => clockInMutation.reset()}>
          {clockInMutation.data.message}
        </Alert>
      )}

      {clockOutMutation.isSuccess && (
        <Alert variant="success" dismissible onClose={() => clockOutMutation.reset()}>
          {clockOutMutation.data.message}
        </Alert>
      )}

      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body className="text-center">
              <h4 className="mb-3">
                Status:{' '}
                <Badge bg={isClockedIn ? 'success' : 'secondary'}>
                  {isClockedIn ? 'Clocked In' : 'Clocked Out'}
                </Badge>
              </h4>

              {isClockedIn && statusData?.clock_in_time && (
                <div className="mb-3">
                  <p className="text-muted mb-1">Clock In Time:</p>
                  <p className="fw-bold">
                    {new Date(statusData.clock_in_time).toLocaleTimeString()}
                  </p>
                  <p className="text-muted mb-1">Current Duration:</p>
                  <p className="fw-bold">{currentDuration.toFixed(2)} hours</p>
                </div>
              )}

              <div className="d-grid gap-2">
                {!isClockedIn ? (
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleClockIn}
                    disabled={clockInMutation.isPending}
                  >
                    {clockInMutation.isPending ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Clocking In...
                      </>
                    ) : (
                      'Clock In'
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={handleClockOut}
                    disabled={clockOutMutation.isPending}
                  >
                    {clockOutMutation.isPending ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Clocking Out...
                      </>
                    ) : (
                      'Clock Out'
                    )}
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <h5 className="mb-3">Today's Summary</h5>
              <div className="mb-3">
                <p className="text-muted mb-1">Total Hours Today:</p>
                <h3 className="mb-0">{todayHours.toFixed(2)} hrs</h3>
              </div>
              {location && (
                <div>
                  <p className="text-muted mb-1">GPS Location:</p>
                  <small className="text-success">
                    ✓ Location tracking enabled
                  </small>
                </div>
              )}
              {!location && (
                <div>
                  <p className="text-muted mb-1">GPS Location:</p>
                  <small className="text-warning">
                    ⚠ Location tracking disabled
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
