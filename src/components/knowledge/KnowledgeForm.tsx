import { useState, useEffect } from 'react';
import type { KnowledgeItem } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { knowledgeApi } from '@/lib/api';

interface KnowledgeFormProps {
  open: boolean;
  item: KnowledgeItem | null;
  onClose: () => void;
}

export function KnowledgeForm({ open, item, onClose }: KnowledgeFormProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setQuestion(item.question);
      setAnswer(item.answer);
      setCategory(item.category || '');
    } else {
      setQuestion('');
      setAnswer('');
      setCategory('');
    }
  }, [item, open]);

  const handleSubmit = async () => {
    if (!question.trim() || !answer.trim()) {
      alert('Domanda e risposta sono obbligatorie');
      return;
    }

    try {
      setSubmitting(true);

      const data = {
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim() || undefined,
      };

      if (item) {
        await knowledgeApi.update(item.id, data);
      } else {
        await knowledgeApi.create(data);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save knowledge item:', error);
      alert('Errore durante il salvataggio del documento');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Modifica Documento' : 'Nuovo Documento'}</DialogTitle>
          <DialogDescription>
            {item
              ? 'Modifica la domanda e la risposta del documento'
              : 'Crea un nuovo documento per la knowledge base'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="question" className="text-sm font-medium mb-2 block">
              Domanda *
            </label>
            <Textarea
              id="question"
              placeholder="Es: Come posso modificare il mio ordine?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <label htmlFor="answer" className="text-sm font-medium mb-2 block">
              Risposta *
            </label>
            <Textarea
              id="answer"
              placeholder="Fornisci una risposta dettagliata..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
            />
          </div>

          <div>
            <label htmlFor="category" className="text-sm font-medium mb-2 block">
              Categoria (opzionale)
            </label>
            <input
              id="category"
              type="text"
              placeholder="Es: Ordini, Spedizioni, Pagamenti"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !question.trim() || !answer.trim()}
          >
            {submitting ? 'Salvo...' : item ? 'Salva Modifiche' : 'Crea Documento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
