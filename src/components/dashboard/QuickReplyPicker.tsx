import { useState, useEffect } from 'react';
import { Zap, Search } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cannedResponsesApi } from '@/lib/api';
import type { CannedResponse } from '@/types';

interface QuickReplyPickerProps {
  onSelect: (content: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  searchQuery?: string;
}

export function QuickReplyPicker({ onSelect, open: externalOpen, onOpenChange, searchQuery: externalSearchQuery }: QuickReplyPickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<CannedResponse[]>([]);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  // Use external search query as initial value, but allow internal modification
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  useEffect(() => {
    if (open) {
      loadResponses();
    }
  }, [open]);

  useEffect(() => {
    filterResponses();
  }, [responses, searchQuery]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const response = await cannedResponsesApi.getAll();
      const allResponses = response.data || response;
      // Mostra solo risposte attive
      const activeResponses = allResponses.filter((r: CannedResponse) => r.isActive);
      setResponses(activeResponses);
    } catch (error) {
      console.error('Failed to load canned responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResponses = () => {
    let filtered = responses;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (resp) =>
          resp.title.toLowerCase().includes(query) ||
          resp.content.toLowerCase().includes(query) ||
          resp.shortcut?.toLowerCase().includes(query)
      );
    }

    setFilteredResponses(filtered);
  };

  const handleSelect = async (response: CannedResponse) => {
    // Incrementa usage count
    try {
      await cannedResponsesApi.incrementUsage(response.id);
    } catch (error) {
      console.error('Failed to increment usage:', error);
    }

    // Inserisci la risposta
    onSelect(response.content);

    // Chiudi il popover
    setOpen(false);
    if (externalSearchQuery === undefined) {
      setInternalSearchQuery('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Risposte Rapide"
        >
          <Zap className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex flex-col h-[400px]">
          {/* Header */}
          <div className="p-3 border-b">
            <h3 className="font-semibold text-sm mb-2">Risposte Rapide</h3>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cerca o digita /shortcut..."
                value={searchQuery}
                onChange={(e) => setInternalSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* List */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Caricamento...
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {responses.length === 0
                  ? 'Nessuna risposta rapida disponibile'
                  : 'Nessuna risposta trovata'}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredResponses.map((response) => (
                  <button
                    key={response.id}
                    onClick={() => handleSelect(response)}
                    className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-sm">{response.title}</span>
                      <div className="flex items-center gap-1 ml-2">
                        {response.isGlobal && (
                          <Badge variant="outline" className="h-5 text-xs">
                            Globale
                          </Badge>
                        )}
                        {response.shortcut && (
                          <Badge variant="secondary" className="h-5 text-xs">
                            /{response.shortcut}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {response.content}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="p-2 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Suggerimento: Digita <Badge variant="outline" className="h-4 text-[10px] mx-1">/</Badge> seguito dallo shortcut nel messaggio
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
