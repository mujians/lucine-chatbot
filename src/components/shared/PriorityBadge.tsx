import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: { label: 'Bassa', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
  NORMAL: { label: 'Normale', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  HIGH: { label: 'Alta', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' },
  URGENT: { label: 'Urgente', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
};

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  if (!config) {
    return <Badge>{priority}</Badge>;
  }

  return (
    <Badge className={cn('border-0', config.className)}>
      {config.label}
    </Badge>
  );
}
