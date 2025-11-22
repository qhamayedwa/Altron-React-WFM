import { Card } from 'react-bootstrap';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <h2 className="mb-4">{title}</h2>
      <Card>
        <Card.Body className="text-center py-5">
          <Construction size={64} className="text-muted mb-3" />
          <h4 className="text-muted">Coming Soon</h4>
          <p className="text-muted mb-0">
            {description || `The ${title} feature is currently under development.`}
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}
