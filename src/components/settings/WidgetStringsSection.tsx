import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface WidgetString {
  key: string;
  value: string;
  isDefault: boolean;
  description?: string;
}

interface StringsByCategory {
  [category: string]: WidgetString[];
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const CATEGORIES = {
  ai: {
    title: 'AI e Digitazione',
    description: 'Messaggi relativi all\'assistente AI'
  },
  welcome: {
    title: 'Messaggi di Benvenuto',
    description: 'Messaggi iniziali e di avvio chat'
  },
  return_to_ai: {
    title: 'Ritorno ad AI',
    description: 'Messaggi per il ritorno dall\'operatore all\'AI'
  },
  end_conversation: {
    title: 'Termina Conversazione',
    description: 'Messaggi per la terminazione della chat'
  },
  file_upload: {
    title: 'Upload File',
    description: 'Messaggi di errore per upload file'
  },
  operator_request: {
    title: 'Richiesta Operatore',
    description: 'Messaggi per richieste operatore'
  },
  fresh_chat: {
    title: 'Nuova Chat',
    description: 'Messaggi per avvio nuova chat'
  },
  rating: {
    title: 'Valutazione (Rating)',
    description: 'Testi del sistema di rating'
  },
  validation: {
    title: 'Validazioni Form',
    description: 'Messaggi di validazione e errore'
  },
  reactivate: {
    title: 'Riattivazione Chat',
    description: 'Messaggi per riattivazione chat chiuse'
  },
  closure: {
    title: 'Chiusura Chat',
    description: 'Messaggi di chiusura chat'
  },
  operator: {
    title: 'Operatore',
    description: 'Messaggi relativi agli operatori'
  }
};

const getCategory = (key: string): string => {
  const parts = key.split('.');
  return parts[0];
};

const getLabel = (key: string): string => {
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];

  // Convert snake_case to Title Case
  return lastPart
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function WidgetStringsSection() {
  const [strings, setStrings] = useState<WidgetString[]>([]);
  const [originalStrings, setOriginalStrings] = useState<WidgetString[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStrings();
  }, []);

  const fetchStrings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/settings/widget-strings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const fetchedStrings = response.data.data.strings;
      setStrings(fetchedStrings);
      setOriginalStrings(JSON.parse(JSON.stringify(fetchedStrings)));
      setChangedKeys(new Set());
    } catch (err: any) {
      console.error('Failed to fetch widget strings:', err);
      setError(err.response?.data?.error?.message || 'Errore nel caricamento delle stringhe');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setStrings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    setSuccess(false);

    // Track changes
    const original = originalStrings.find(s => s.key === key);
    setChangedKeys(prev => {
      const newSet = new Set(prev);
      if (original && value !== original.value) {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const token = localStorage.getItem('token');
      const stringsObject: { [key: string]: string } = {};

      strings.forEach(s => {
        stringsObject[s.key] = s.value;
      });

      await axios.put(
        `${BACKEND_URL}/api/settings/widget-strings`,
        { strings: stringsObject },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setOriginalStrings(JSON.parse(JSON.stringify(strings)));
      setChangedKeys(new Set());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save widget strings:', err);
      setError(err.response?.data?.error?.message || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Sei sicuro di voler ripristinare tutte le stringhe ai valori predefiniti? Questa azione non può essere annullata.')) {
      return;
    }

    try {
      setResetting(true);
      setError(null);
      setSuccess(false);

      const token = localStorage.getItem('token');
      await axios.post(
        `${BACKEND_URL}/api/settings/widget-strings/reset`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      await fetchStrings();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to reset widget strings:', err);
      setError(err.response?.data?.error?.message || 'Errore nel reset');
    } finally {
      setResetting(false);
    }
  };

  const groupedStrings: StringsByCategory = strings.reduce((acc, str) => {
    const category = getCategory(str.key);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(str);
    return acc;
  }, {} as StringsByCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stringhe Widget</h2>
          <p className="text-muted-foreground mt-1">
            Personalizza tutti i testi visualizzati nel widget chat
          </p>
        </div>
        <div className="flex items-center gap-3">
          {changedKeys.size > 0 && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="font-medium">
                {changedKeys.size} {changedKeys.size === 1 ? 'modifica' : 'modifiche'}
              </span>
            </div>
          )}
          <Button
            onClick={handleReset}
            disabled={resetting || saving}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {resetting ? 'Resetting...' : 'Reset Defaults'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || changedKeys.size === 0}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </Button>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Errore</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-lg p-4">
          ✅ Stringhe salvate con successo! Il widget utilizzerà i nuovi testi.
        </div>
      )}

      {/* String categories */}
      <div className="space-y-6">
        {Object.entries(groupedStrings).map(([category, categoryStrings]) => {
          const categoryInfo = CATEGORIES[category as keyof typeof CATEGORIES];

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{categoryInfo?.title || category}</CardTitle>
                <CardDescription>{categoryInfo?.description || ''}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryStrings.map(str => {
                  const isChanged = changedKeys.has(str.key);
                  const isMultiline = str.value.length > 80 || str.value.includes('\n');

                  return (
                    <div key={str.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={str.key} className="flex items-center gap-2">
                          {getLabel(str.key)}
                          {isChanged && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-normal">
                              (modificato)
                            </span>
                          )}
                        </Label>
                        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {str.key}
                        </code>
                      </div>
                      {isMultiline ? (
                        <Textarea
                          id={str.key}
                          value={str.value}
                          onChange={(e) => handleChange(str.key, e.target.value)}
                          rows={3}
                          className={isChanged ? 'border-amber-500' : ''}
                        />
                      ) : (
                        <Input
                          id={str.key}
                          value={str.value}
                          onChange={(e) => handleChange(str.key, e.target.value)}
                          className={isChanged ? 'border-amber-500' : ''}
                        />
                      )}
                      {str.description && (
                        <p className="text-xs text-muted-foreground">{str.description}</p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
