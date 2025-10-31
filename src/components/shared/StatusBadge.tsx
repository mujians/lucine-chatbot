import { Badge } from '@/components/ui/badge';

type ChatStatus = 'ACTIVE' | 'WAITING' | 'WITH_OPERATOR' | 'CLOSED' | 'TICKET_CREATED';
type TicketStatus = 'PENDING' | 'ASSIGNED' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

type Status = ChatStatus | TicketStatus;

const statusConfig: Record<Status, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  // Chat statuses
  ACTIVE: { label: 'Attivo', variant: 'default' },
  WAITING: { label: 'In Coda', variant: 'secondary' },
  WITH_OPERATOR: { label: 'Con Operatore', variant: 'default' },
  CLOSED: { label: 'Chiuso', variant: 'secondary' },
  TICKET_CREATED: { label: 'Ticket Creato', variant: 'outline' },

  // Ticket statuses
  PENDING: { label: 'In Attesa', variant: 'secondary' },
  ASSIGNED: { label: 'Assegnato', variant: 'outline' },
  OPEN: { label: 'Aperto', variant: 'default' },
  IN_PROGRESS: { label: 'In Lavorazione', variant: 'default' },
  RESOLVED: { label: 'Risolto', variant: 'default' },
};

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
