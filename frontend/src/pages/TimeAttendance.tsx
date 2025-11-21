import { useState, useEffect } from 'react';
import { Card, Button, Table, Badge } from 'react-bootstrap';
import { Clock } from 'lucide-react';
import api from '../api/client';

export default function TimeAttendance() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClockIn = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          await api.post('/time-attendance/clock-in', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          alert('Clocked in successfully!');
          loadEntries();
        } catch (error) {
          console.error('Clock in failed:', error);
          alert('Failed to clock in');
        }
      });
    } else {
      try {
        await api.post('/time-attendance/clock-in', {});
        alert('Clocked in successfully!');
        loadEntries();
      } catch (error) {
        console.error('Clock in failed:', error);
        alert('Failed to clock in');
      }
    }
  };

  const loadEntries = async () => {
    try {
      const response = await api.get('/time-attendance/entries');
      setEntries(response.data.timeEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Time & Attendance</h2>
        <Button variant="primary" onClick={handleClockIn}>
          <Clock size={18} className="me-2" />
          Clock In
        </Button>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">My Time Entries</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No time entries found
                  </td>
                </tr>
              ) : (
                entries.map((entry: any) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.clockInTime).toLocaleDateString()}</td>
                    <td>{new Date(entry.clockInTime).toLocaleTimeString()}</td>
                    <td>{entry.clockOutTime ? new Date(entry.clockOutTime).toLocaleTimeString() : '-'}</td>
                    <td>{entry.totalHours ? entry.totalHours.toFixed(2) : '-'}</td>
                    <td>
                      <Badge bg={entry.status === 'approved' ? 'success' : entry.status === 'clocked_in' ? 'info' : 'secondary'}>
                        {entry.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
