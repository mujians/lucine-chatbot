import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface TicketFiltersProps {
  filters: {
    status: string;
    priority: string;
  };
  onChange: (filters: { status: string; priority: string }) => void;
}

export function TicketFilters({ filters, onChange }: TicketFiltersProps) {
  const hasActiveFilters = filters.status || filters.priority;

  const clearFilters = () => {
    onChange({ status: '', priority: '' });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 flex items-center gap-2">
        <Select
          value={filters.status}
          onValueChange={(value: string) => onChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tutti gli stati" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="PENDING">In Attesa</SelectItem>
            <SelectItem value="OPEN">Aperto</SelectItem>
            <SelectItem value="ASSIGNED">Assegnato</SelectItem>
            <SelectItem value="RESOLVED">Risolto</SelectItem>
            <SelectItem value="CLOSED">Chiuso</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value: string) => onChange({ ...filters, priority: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tutte le priorità" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le priorità</SelectItem>
            <SelectItem value="LOW">Bassa</SelectItem>
            <SelectItem value="NORMAL">Normale</SelectItem>
            <SelectItem value="HIGH">Alta</SelectItem>
            <SelectItem value="URGENT">Urgente</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10"
          >
            <X className="h-4 w-4 mr-1" />
            Cancella filtri
          </Button>
        )}
      </div>
    </div>
  );
}
