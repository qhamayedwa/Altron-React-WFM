import { Card } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div>
      <h2 className="mb-4">My Profile</h2>
      <Card>
        <Card.Body>
          <h5>{user?.firstName} {user?.lastName}</h5>
          <p className="text-muted mb-1">Username: {user?.username}</p>
          <p className="text-muted mb-1">Email: {user?.email}</p>
          <p className="text-muted mb-1">Tenant: {user?.tenantName}</p>
          <p className="text-muted mb-1">Roles: {user?.roles.join(', ')}</p>
        </Card.Body>
      </Card>
    </div>
  );
}
