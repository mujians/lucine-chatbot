import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { knowledgeApi } from '@/lib/api';

interface BulkImportDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ParsedItem {
  title?: string;
  content: string;
  category?: string;
}

export function BulkImportDialog({ open, onClose }: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ imported: number; total: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    setItems([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;

        if (selectedFile.name.endsWith('.json')) {
          // Parse JSON
          const parsed = JSON.parse(text);
          const itemsArray = Array.isArray(parsed) ? parsed : [parsed];
          setItems(itemsArray.map(item => ({
            title: item.title || item.question || '',
            content: item.content || item.answer || '',
            category: item.category || '',
          })));
        } else if (selectedFile.name.endsWith('.csv')) {
          // Parse CSV
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));

          const parsed = lines.slice(1).map(line => {
            // Simple CSV parsing (handles quoted fields)
            const values: string[] = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());

            const obj: Record<string, string> = {};
            headers.forEach((header, index) => {
              obj[header] = values[index]?.replace(/^"|"$/g, '') || '';
            });
            return obj;
          });

          setItems(parsed.map(item => ({
            title: item.title || item.question || '',
            content: item.content || item.answer || '',
            category: item.category || '',
          })).filter(item => item.content)); // Skip items without content
        } else {
          setError('Formato file non supportato. Usa CSV o JSON.');
        }
      } catch (err) {
        console.error('Parse error:', err);
        setError('Errore nel parsing del file. Verifica il formato.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (items.length === 0) {
      setError('Nessun elemento valido da importare');
      return;
    }

    try {
      setImporting(true);
      setError(null);

      // Convert to backend format
      const payload = items.map(item => ({
        title: item.title,
        content: item.content,
        category: item.category || 'ALTRO',
      }));

      const response = await knowledgeApi.bulkImport(payload);

      setSuccess({
        imported: response.data.imported,
        total: response.data.total,
      });

      // Reset after 2 seconds
      setTimeout(() => {
        onClose();
        setFile(null);
        setItems([]);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Import error:', err);
      setError('Errore durante l\'importazione. Riprova.');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (!importing) {
      setFile(null);
      setItems([]);
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importa Knowledge Base</DialogTitle>
          <DialogDescription>
            Importa documenti da file CSV o JSON. I formati supportati sono:
            <ul className="mt-2 space-y-1 text-xs">
              <li><strong>CSV:</strong> title,content,category (solo content obbligatorio)</li>
              <li><strong>JSON:</strong> Array di oggetti con campi title/content/category</li>
            </ul>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              type="file"
              id="bulk-import-file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
              disabled={importing}
            />
            <label
              htmlFor="bulk-import-file"
              className={`cursor-pointer flex flex-col items-center gap-2 ${importing ? 'opacity-50' : ''}`}
            >
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm font-medium">
                {file ? file.name : 'Carica file CSV o JSON'}
              </p>
              <p className="text-xs text-muted-foreground">
                Click per selezionare un file
              </p>
            </label>
          </div>

          {/* Preview */}
          {items.length > 0 && !success && (
            <div className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Preview ({items.length} {items.length === 1 ? 'documento' : 'documenti'})
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {items.slice(0, 5).map((item, index) => (
                  <div key={index} className="bg-muted p-3 rounded text-xs">
                    {item.title && <div className="font-medium mb-1">{item.title}</div>}
                    <div className="text-muted-foreground line-clamp-2">
                      {item.content.substring(0, 150)}
                      {item.content.length > 150 && '...'}
                    </div>
                    {item.category && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Categoria: {item.category}
                      </div>
                    )}
                  </div>
                ))}
                {items.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    ... e altri {items.length - 5} documenti
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-500/10 text-green-600 border border-green-500/20 rounded-md p-3 flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Importati con successo {success.imported}/{success.total} documenti!
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            {success ? 'Chiudi' : 'Annulla'}
          </Button>
          {!success && (
            <Button
              onClick={handleImport}
              disabled={importing || items.length === 0}
            >
              {importing ? 'Importo...' : `Importa ${items.length} ${items.length === 1 ? 'documento' : 'documenti'}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
