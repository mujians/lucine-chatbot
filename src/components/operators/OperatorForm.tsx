import { useState, useEffect } from 'react';
import type { Operator } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { operatorsApi } from '@/lib/api';

interface OperatorFormProps {
  open: boolean;
  operator: Operator | null;
  onClose: () => void;
}

export function OperatorForm({ open, operator, onClose }: OperatorFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'OPERATOR' | 'ADMIN'>('OPERATOR');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (operator) {
      setName(operator.name);
      setEmail(operator.email);
      setRole(operator.role as 'OPERATOR' | 'ADMIN');
      setPassword(''); // Don't populate password for security
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('OPERATOR');
    }
  }, [operator, open]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      alert('Nome e email sono obbligatori');
      return;
    }

    if (!operator && !password.trim()) {
      alert('La password è obbligatoria per creare un nuovo operatore');
      return;
    }

    try {
      setSubmitting(true);

      if (operator) {
        const data: { name?: string; email?: string; role?: 'OPERATOR' | 'ADMIN' } = {
          name: name.trim(),
          email: email.trim(),
          role,
        };
        await operatorsApi.update(operator.id, data);
      } else {
        const data = {
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
        };
        await operatorsApi.create(data);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save operator:', error);
      alert('Errore durante il salvataggio dell\'operatore');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{operator ? 'Modifica Operatore' : 'Nuovo Operatore'}</DialogTitle>
          <DialogDescription>
            {operator
              ? 'Modifica i dettagli dell\'operatore'
              : 'Crea un nuovo operatore per il sistema'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium mb-2 block">
              Nome *
            </label>
            <input
              id="name"
              type="text"
              placeholder="Mario Rossi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium mb-2 block">
              Email *
            </label>
            <input
              id="email"
              type="email"
              placeholder="mario.rossi@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium mb-2 block">
              Password {operator ? '(lascia vuoto per non modificare)' : '*'}
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div>
            <label htmlFor="role" className="text-sm font-medium mb-2 block">
              Ruolo *
            </label>
            <Select value={role} onValueChange={(value: string) => setRole(value as 'OPERATOR' | 'ADMIN')}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona ruolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPERATOR">Operatore</SelectItem>
                <SelectItem value="ADMIN">Amministratore</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !name.trim() || !email.trim() || (!operator && !password.trim())}
          >
            {submitting ? 'Salvo...' : operator ? 'Salva Modifiche' : 'Crea Operatore'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
