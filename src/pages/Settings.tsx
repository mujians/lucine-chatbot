import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { settingsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface SettingsState {
  // AI Settings
  openaiApiKey: string;
  openaiModel: string;
  openaiTemperature: number;
  aiConfidenceThreshold: number;

  // WhatsApp Settings
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioWhatsappNumber: string;

  // Email Settings
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  emailFrom: string;

  // Widget Settings
  widgetPrimaryColor: string;
  widgetPosition: string;
  widgetGreeting: string;
  widgetTitle: string;
  widgetSubtitle: string;
}

const defaultSettings: SettingsState = {
  openaiApiKey: '',
  openaiModel: 'gpt-4-turbo-preview',
  openaiTemperature: 0.7,
  aiConfidenceThreshold: 0.7,
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioWhatsappNumber: '',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: '',
  emailFrom: '',
  widgetPrimaryColor: '#6366f1',
  widgetPosition: 'bottom-right',
  widgetGreeting: 'Ciao! Come posso aiutarti?',
  widgetTitle: 'LUCY - ASSISTENTE VIRTUALE',
  widgetSubtitle: 'Chiedimi quello che vuoi sapere.',
};

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await settingsApi.getAll();
      const allSettings = Array.isArray(response) ? response : (response?.data || []);

      const settingsMap: Record<string, any> = {};
      allSettings.forEach((setting: any) => {
        settingsMap[setting.key] = setting.value;
      });

      setSettings((prev) => ({
        ...prev,
        ...settingsMap,
      }));
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Errore durante il caricamento delle impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof SettingsState, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Save all settings
      for (const [key, value] of Object.entries(settings)) {
        await settingsApi.upsert(key, value);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Errore durante il salvataggio delle impostazioni');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Impostazioni"
          description="Configura le impostazioni del sistema"
          action={
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvo...' : 'Salva Modifiche'}
            </Button>
          }
        />

        <div className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-md p-3">
            Impostazioni salvate con successo!
          </div>
        )}

        {/* AI Settings */}
        <SettingsSection
          title="Intelligenza Artificiale"
          description="Configura le impostazioni dell'AI e del modello OpenAI"
          fields={[
            {
              label: 'OpenAI API Key',
              type: 'password',
              value: settings.openaiApiKey,
              onChange: (value) => handleChange('openaiApiKey', value),
              placeholder: 'sk-...',
            },
            {
              label: 'Modello OpenAI',
              type: 'select',
              value: settings.openaiModel,
              onChange: (value) => handleChange('openaiModel', value),
              options: [
                { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' },
                { value: 'gpt-4', label: 'GPT-4' },
                { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
              ],
            },
            {
              label: 'Temperature',
              type: 'number',
              value: settings.openaiTemperature,
              onChange: (value) => handleChange('openaiTemperature', parseFloat(value)),
              min: 0,
              max: 1,
              step: 0.1,
            },
            {
              label: 'Confidence Threshold',
              type: 'number',
              value: settings.aiConfidenceThreshold,
              onChange: (value) => handleChange('aiConfidenceThreshold', parseFloat(value)),
              min: 0,
              max: 1,
              step: 0.1,
              description: 'Soglia minima di confidenza per le risposte AI (0-1)',
            },
          ]}
        />

        {/* WhatsApp Settings */}
        <SettingsSection
          title="WhatsApp (Twilio)"
          description="Configura l'integrazione WhatsApp tramite Twilio"
          fields={[
            {
              label: 'Twilio Account SID',
              type: 'text',
              value: settings.twilioAccountSid,
              onChange: (value) => handleChange('twilioAccountSid', value),
              placeholder: 'AC...',
            },
            {
              label: 'Twilio Auth Token',
              type: 'password',
              value: settings.twilioAuthToken,
              onChange: (value) => handleChange('twilioAuthToken', value),
            },
            {
              label: 'Numero WhatsApp',
              type: 'text',
              value: settings.twilioWhatsappNumber,
              onChange: (value) => handleChange('twilioWhatsappNumber', value),
              placeholder: 'whatsapp:+14155238886',
            },
          ]}
        />

        {/* Email Settings */}
        <SettingsSection
          title="Email (SMTP)"
          description="Configura il server SMTP per l'invio di email"
          fields={[
            {
              label: 'SMTP Host',
              type: 'text',
              value: settings.smtpHost,
              onChange: (value) => handleChange('smtpHost', value),
              placeholder: 'smtp.gmail.com',
            },
            {
              label: 'SMTP Port',
              type: 'number',
              value: settings.smtpPort,
              onChange: (value) => handleChange('smtpPort', parseInt(value)),
              placeholder: '587',
            },
            {
              label: 'SMTP User',
              type: 'text',
              value: settings.smtpUser,
              onChange: (value) => handleChange('smtpUser', value),
              placeholder: 'user@example.com',
            },
            {
              label: 'SMTP Password',
              type: 'password',
              value: settings.smtpPassword,
              onChange: (value) => handleChange('smtpPassword', value),
            },
            {
              label: 'Email From',
              type: 'text',
              value: settings.emailFrom,
              onChange: (value) => handleChange('emailFrom', value),
              placeholder: 'noreply@lucinedinatale.it',
            },
          ]}
        />

        {/* Widget Settings */}
        <SettingsSection
          title="Widget"
          description="Configura l'aspetto e il comportamento del widget"
          fields={[
            {
              label: 'Colore Primario',
              type: 'color',
              value: settings.widgetPrimaryColor,
              onChange: (value) => handleChange('widgetPrimaryColor', value),
            },
            {
              label: 'Posizione',
              type: 'select',
              value: settings.widgetPosition,
              onChange: (value) => handleChange('widgetPosition', value),
              options: [
                { value: 'bottom-right', label: 'In basso a destra' },
                { value: 'bottom-left', label: 'In basso a sinistra' },
                { value: 'top-right', label: 'In alto a destra' },
                { value: 'top-left', label: 'In alto a sinistra' },
              ],
            },
            {
              label: 'Titolo Widget',
              type: 'text',
              value: settings.widgetTitle,
              onChange: (value) => handleChange('widgetTitle', value),
              placeholder: 'LUCY - ASSISTENTE VIRTUALE',
            },
            {
              label: 'Sottotitolo Widget',
              type: 'text',
              value: settings.widgetSubtitle,
              onChange: (value) => handleChange('widgetSubtitle', value),
              placeholder: 'Chiedimi quello che vuoi sapere.',
            },
            {
              label: 'Messaggio di Benvenuto',
              type: 'text',
              value: settings.widgetGreeting,
              onChange: (value) => handleChange('widgetGreeting', value),
              placeholder: 'Ciao! Sono Lucy, il tuo assistente virtuale. 👋',
            },
          ]}
        />
        </div>
      </div>
    </DashboardLayout>
  );
}
