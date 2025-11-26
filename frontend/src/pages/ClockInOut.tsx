import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { MapPin, Clock, Play, Square, Coffee, Wifi, WifiOff, CheckCircle, AlertTriangle, Navigation } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';

interface CurrentShift {
  id: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  shiftType: string;
  siteName?: string;
}

interface ActiveTimeEntry {
  id: number;
  clockInTime: string;
  clockInLatitude?: number;
  clockInLongitude?: number;
  geofenceStatus?: string;
}

interface GeofenceStatus {
  isInside: boolean;
  distance?: number;
  geofenceName?: string;
  message: string;
}

export default function ClockInOut() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [currentShift, setCurrentShift] = useState<CurrentShift | null>(null);
  const [activeEntry, setActiveEntry] = useState<ActiveTimeEntry | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [geofenceStatus, setGeofenceStatus] = useState<GeofenceStatus | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeEntry) {
      const updateElapsed = () => {
        const start = new Date(activeEntry.clockInTime);
        const now = new Date();
        const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      };
      updateElapsed();
      const timer = setInterval(updateElapsed, 1000);
      return () => clearInterval(timer);
    }
  }, [activeEntry]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  const processOfflineQueue = async () => {
    const queue = [...offlineQueue];
    for (const action of queue) {
      try {
        if (action.type === 'clock-in') {
          await api.post('/time-attendance/clock-in', action.data);
        } else if (action.type === 'clock-out') {
          await api.post(`/time-attendance/clock-out/${action.entryId}`, action.data);
        }
        setOfflineQueue(prev => prev.filter(a => a !== action));
      } catch (err) {
        console.error('Failed to process offline action:', err);
      }
    }
  };

  const getCurrentLocation = useCallback(() => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(coords);
          setLocationError(null);
          resolve(coords);
        },
        (error) => {
          let message = 'Unable to get your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          setLocationError(message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  const checkGeofence = async (lat: number, lng: number) => {
    try {
      const response = await api.post('/time-attendance/check-geofence', {
        latitude: lat,
        longitude: lng
      });
      setGeofenceStatus(response.data);
      return response.data;
    } catch (err) {
      setGeofenceStatus({
        isInside: true,
        message: 'Geofence check unavailable - proceeding with clock action'
      });
      return { isInside: true };
    }
  };

  const loadCurrentStatus = async () => {
    try {
      setLoading(true);
      
      const [shiftRes, entryRes] = await Promise.all([
        api.get('/scheduling/my-current-shift').catch(() => ({ data: null })),
        api.get('/time-attendance/active-entry').catch(() => ({ data: null }))
      ]);

      if (shiftRes.data?.shift) {
        setCurrentShift(shiftRes.data.shift);
      }

      if (entryRes.data?.activeEntry) {
        setActiveEntry(entryRes.data.activeEntry);
      }

      try {
        const coords = await getCurrentLocation();
        await checkGeofence(coords.lat, coords.lng);
      } catch (locErr) {
        console.log('Location not available:', locErr);
      }
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentStatus();
  }, []);

  const handleClockIn = async () => {
    setError(null);
    setSuccess(null);
    setClockLoading(true);

    try {
      let coords = location;
      
      if (!coords) {
        try {
          coords = await getCurrentLocation();
        } catch (locErr) {
          console.log('Proceeding without location');
        }
      }

      if (coords) {
        const geoStatus = await checkGeofence(coords.lat, coords.lng);
        if (!geoStatus.isInside) {
          setError(`You are outside the allowed work area. ${geoStatus.message || ''}`);
          setClockLoading(false);
          return;
        }
      }

      const clockData = {
        latitude: coords?.lat,
        longitude: coords?.lng,
        clockSource: 'web',
        offlineFlag: !isOnline
      };

      if (!isOnline) {
        setOfflineQueue(prev => [...prev, { type: 'clock-in', data: clockData, timestamp: new Date() }]);
        setActiveEntry({
          id: -1,
          clockInTime: new Date().toISOString(),
          clockInLatitude: coords?.lat,
          clockInLongitude: coords?.lng,
          geofenceStatus: 'pending'
        });
        setSuccess('Clock in queued. Will sync when online.');
      } else {
        const response = await api.post('/time-attendance/clock-in', clockData);
        setActiveEntry(response.data.timeEntry);
        setSuccess('Successfully clocked in!');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to clock in');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeEntry) return;
    
    setShowBreakModal(true);
  };

  const confirmClockOut = async () => {
    if (!activeEntry) return;
    
    setShowBreakModal(false);
    setError(null);
    setSuccess(null);
    setClockLoading(true);

    try {
      let coords = location;
      
      if (!coords) {
        try {
          coords = await getCurrentLocation();
        } catch (locErr) {
          console.log('Proceeding without location');
        }
      }

      const clockData = {
        latitude: coords?.lat,
        longitude: coords?.lng,
        breakMinutes,
        clockSource: 'web',
        offlineFlag: !isOnline
      };

      if (!isOnline) {
        setOfflineQueue(prev => [...prev, { 
          type: 'clock-out', 
          entryId: activeEntry.id, 
          data: clockData, 
          timestamp: new Date() 
        }]);
        setActiveEntry(null);
        setSuccess('Clock out queued. Will sync when online.');
      } else {
        await api.post(`/time-attendance/clock-out/${activeEntry.id}`, clockData);
        setActiveEntry(null);
        setSuccess('Successfully clocked out!');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to clock out');
    } finally {
      setClockLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading clock status...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-2">
              {isOnline ? (
                <Badge bg="success" className="d-flex align-items-center gap-1">
                  <Wifi size={14} /> Online
                </Badge>
              ) : (
                <Badge bg="warning" className="d-flex align-items-center gap-1">
                  <WifiOff size={14} /> Offline
                </Badge>
              )}
              {offlineQueue.length > 0 && (
                <Badge bg="info">{offlineQueue.length} pending</Badge>
              )}
            </div>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

          <Card className="shadow-sm mb-4" style={{ 
            background: 'linear-gradient(135deg, #28468D 0%, #54B8DF 100%)',
            color: 'white'
          }}>
            <Card.Body className="text-center py-5">
              <div className="mb-2 opacity-75">{formatDate(currentTime)}</div>
              <h1 className="display-2 fw-bold mb-3" style={{ fontFamily: 'monospace' }}>
                {formatTime(currentTime)}
              </h1>
              {currentShift && (
                <div className="mt-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <small className="opacity-75">Today's Shift</small>
                  <div className="fw-semibold">
                    {currentShift.startTime} - {currentShift.endTime}
                    {currentShift.siteName && <span className="ms-2">@ {currentShift.siteName}</span>}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {activeEntry ? (
            <Card className="shadow-sm mb-4 border-success" style={{ borderWidth: 2 }}>
              <Card.Body className="text-center py-4">
                <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                  <div className="bg-success rounded-circle p-2">
                    <CheckCircle size={24} color="white" />
                  </div>
                  <h4 className="mb-0 text-success">You are clocked in</h4>
                </div>
                
                <div className="mb-4">
                  <small className="text-muted">Time Elapsed</small>
                  <h2 className="display-5 fw-bold" style={{ fontFamily: 'monospace', color: '#28468D' }}>
                    {elapsedTime}
                  </h2>
                  <small className="text-muted">
                    Since {new Date(activeEntry.clockInTime).toLocaleTimeString('en-ZA', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </small>
                </div>

                <Button
                  variant="danger"
                  size="lg"
                  className="px-5 py-3 d-flex align-items-center gap-2 mx-auto"
                  onClick={handleClockOut}
                  disabled={clockLoading}
                >
                  {clockLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <Square size={24} />
                  )}
                  Clock Out
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm mb-4">
              <Card.Body className="text-center py-4">
                <div className="mb-4">
                  <Clock size={48} className="text-muted mb-2" />
                  <h4>Ready to start your shift?</h4>
                  <p className="text-muted">Press the button below to clock in</p>
                </div>

                <Button
                  variant="success"
                  size="lg"
                  className="px-5 py-3 d-flex align-items-center gap-2 mx-auto"
                  onClick={handleClockIn}
                  disabled={clockLoading}
                  style={{ 
                    background: 'linear-gradient(135deg, #28A745, #20C997)',
                    border: 'none'
                  }}
                >
                  {clockLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <Play size={24} />
                  )}
                  Clock In
                </Button>
              </Card.Body>
            </Card>
          )}

          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <MapPin size={18} /> Location Status
              </h6>
            </Card.Header>
            <Card.Body>
              {locationError ? (
                <Alert variant="warning" className="mb-0 d-flex align-items-center gap-2">
                  <AlertTriangle size={18} />
                  {locationError}
                </Alert>
              ) : location ? (
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Navigation size={18} className="text-success" />
                    <span className="text-success fw-semibold">Location detected</span>
                  </div>
                  <small className="text-muted">
                    Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </small>
                  {geofenceStatus && (
                    <div className={`mt-2 p-2 rounded ${geofenceStatus.isInside ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                      <small>
                        {geofenceStatus.isInside ? (
                          <span className="text-success">
                            <CheckCircle size={14} className="me-1" />
                            Inside work area {geofenceStatus.geofenceName && `(${geofenceStatus.geofenceName})`}
                          </span>
                        ) : (
                          <span className="text-danger">
                            <AlertTriangle size={14} className="me-1" />
                            Outside work area - {geofenceStatus.distance}m away
                          </span>
                        )}
                      </small>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-2">
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span className="text-muted">Detecting location...</span>
                </div>
              )}
              
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="mt-3 w-100"
                onClick={getCurrentLocation}
              >
                <MapPin size={14} className="me-1" /> Refresh Location
              </Button>
            </Card.Body>
          </Card>

          <Modal show={showBreakModal} onHide={() => setShowBreakModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title className="d-flex align-items-center gap-2">
                <Coffee /> Break Time
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>How much break time did you take today?</p>
              <Form.Group>
                <Form.Label>Break Duration (minutes)</Form.Label>
                <Form.Select 
                  value={breakMinutes} 
                  onChange={(e) => setBreakMinutes(parseInt(e.target.value))}
                >
                  <option value={0}>No break</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes (1 hour)</option>
                  <option value={90}>90 minutes</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowBreakModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmClockOut}>
                Confirm Clock Out
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}
