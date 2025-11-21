import React, { useState } from 'react';
import { Container, Table, Button, Card, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface PendingEntry {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string | null;
    last_name: string | null;
    department: string | null;
  };
  clock_in_time: string;
  clock_out_time: string | null;
  total_hours: number;
  status: string;
  notes: string | null;
}

export const ApprovalsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PendingEntry | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionNotes, setActionNotes] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const response = await api.get('/time/pending-approvals');
      return response.data.data as PendingEntry[];
    },
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: async (payload: { entry_id: number; notes?: string }) => {
      const response = await api.post('/time/approve', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      setShowModal(false);
      setActionNotes('');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (payload: { entry_id: number; notes?: string }) => {
      const response = await api.post('/time/reject', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      setShowModal(false);
      setActionNotes('');
    },
  });

  const handleAction = (entry: PendingEntry, type: 'approve' | 'reject') => {
    setSelectedEntry(entry);
    setActionType(type);
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (!selectedEntry) return;

    const payload = {
      entry_id: selectedEntry.id,
      notes: actionNotes || undefined,
    };

    if (actionType === 'approve') {
      approveMutation.mutate(payload);
    } else {
      rejectMutation.mutate(payload);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const fullName = (entry: PendingEntry) => {
    if (entry.user.first_name && entry.user.last_name) {
      return `${entry.user.first_name} ${entry.user.last_name}`;
    }
    return entry.user.username;
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error instanceof Error && error.message.includes('permission')
            ? 'You do not have permission to view approvals.'
            : 'Failed to load pending approvals. Please try again.'}
        </Alert>
      </Container>
    );
  }

  const pendingEntries = data || [];

  return (
    <Container className="py-4">
      <h2 className="mb-4">Pending Time Entry Approvals</h2>

      {approveMutation.isError && (
        <Alert variant="danger" dismissible onClose={() => approveMutation.reset()}>
          {approveMutation.error instanceof Error
            ? approveMutation.error.message
            : 'Failed to approve entry. Please try again.'}
        </Alert>
      )}

      {rejectMutation.isError && (
        <Alert variant="danger" dismissible onClose={() => rejectMutation.reset()}>
          {rejectMutation.error instanceof Error
            ? rejectMutation.error.message
            : 'Failed to reject entry. Please try again.'}
        </Alert>
      )}

      {approveMutation.isSuccess && (
        <Alert variant="success" dismissible onClose={() => approveMutation.reset()}>
          Time entry approved successfully!
        </Alert>
      )}

      {rejectMutation.isSuccess && (
        <Alert variant="info" dismissible onClose={() => rejectMutation.reset()}>
          Time entry rejected.
        </Alert>
      )}

      <Card>
        <Card.Body>
          {pendingEntries.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No pending approvals at this time.
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Total Hours</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{fullName(entry)}</td>
                    <td>{entry.user.department || '-'}</td>
                    <td>{formatDateTime(entry.clock_in_time)}</td>
                    <td>
                      {entry.clock_out_time ? formatDateTime(entry.clock_out_time) : '-'}
                    </td>
                    <td>{entry.total_hours.toFixed(2)} hrs</td>
                    <td>
                      {entry.notes ? (
                        <small className="text-muted">{entry.notes}</small>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleAction(entry, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleAction(entry, 'reject')}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'approve' ? 'Approve' : 'Reject'} Time Entry
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEntry && (
            <>
              <p>
                <strong>Employee:</strong> {fullName(selectedEntry)}
              </p>
              <p>
                <strong>Total Hours:</strong> {selectedEntry.total_hours.toFixed(2)} hrs
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Notes (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={`Add a note for this ${actionType}...`}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant={actionType === 'approve' ? 'success' : 'danger'}
            onClick={handleConfirm}
            disabled={approveMutation.isPending || rejectMutation.isPending}
          >
            {approveMutation.isPending || rejectMutation.isPending ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
