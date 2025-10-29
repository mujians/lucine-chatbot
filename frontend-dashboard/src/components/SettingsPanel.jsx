import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';

const SettingsPanel = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data.data?.settings || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setLoading(false);
    }
  };

  const handleSave = async (setting) => {
    setSaving(true);

    try {
      await axios.put(`/api/settings/${setting.key}`, { value: setting.value });
      setEditingKey(null);
      fetchSettings();
    } catch (error) {
      console.error('Error saving setting:', error);
      alert(error.response?.data?.error?.message || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, newValue) => {
    setSettings(
      settings.map((s) =>
        s.key === key ? { ...s, value: newValue} : s
      )
    );
  };

  // P2.3: Test Email Connection
  const handleTestEmail = async () => {
    setTestingEmail(true);
    setTestResults({ ...testResults, email: null });

    try {
      const response = await axios.post('/api/settings/test-email');
      setTestResults({
        ...testResults,
        email: { success: true, message: response.data.message },
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        email: {
          success: false,
          message: error.response?.data?.error?.message || 'Connection failed',
        },
      });
    } finally {
      setTestingEmail(false);
    }
  };

  // P2.3: Test WhatsApp Connection
  const handleTestWhatsApp = async () => {
    setTestingWhatsApp(true);
    setTestResults({ ...testResults, whatsapp: null });

    try {
      const response = await axios.post('/api/settings/test-whatsapp');
      setTestResults({
        ...testResults,
        whatsapp: { success: true, message: response.data.message },
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        whatsapp: {
          success: false,
          message: error.response?.data?.error?.message || 'Connection failed',
        },
      });
    } finally {
      setTestingWhatsApp(false);
    }
  };

  const getCategorySettings = (category) => {
    return settings.filter((s) => s.category === category);
  };

  const renderSettingInput = (setting) => {
    const valueType = typeof setting.value;

    if (valueType === 'boolean') {
      return (
        <div className="flex items-center gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => handleChange(setting.key, e.target.checked)}
              className="w-5 h-5 text-christmas-green border-gray-300 rounded focus:ring-christmas-green"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              {setting.value ? 'Abilitato' : 'Disabilitato'}
            </span>
          </label>
        </div>
      );
    }

    if (valueType === 'number') {
      return (
        <input
          type="number"
          value={setting.value}
          onChange={(e) => handleChange(setting.key, parseFloat(e.target.value))}
          step={setting.key.includes('THRESHOLD') ? '0.1' : '1'}
          min="0"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-christmas-green"
        />
      );
    }

    return (
      <input
        type="text"
        value={setting.value}
        onChange={(e) => handleChange(setting.key, e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-christmas-green"
      />
    );
  };

  const categories = [
    { key: 'general', label: 'Generale', icon: '⚙️' },
    { key: 'chat', label: 'Chat', icon: '💬' },
    { key: 'ai', label: 'AI', icon: '🤖' },
    { key: 'notification', label: 'Notifiche', icon: '🔔' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>
        <p className="text-gray-600">Configura il comportamento del sistema</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categorySettings = getCategorySettings(category.key);

            if (categorySettings.length === 0) return null;

            return (
              <div
                key={category.key}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
              >
                {/* Category Header */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    {category.label}
                  </h2>
                </div>

                {/* Settings List */}
                <div className="divide-y divide-gray-200">
                  {categorySettings.map((setting) => (
                    <div key={setting.key} className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {setting.key.replace(/_/g, ' ')}
                            </h3>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {setting.key}
                            </span>
                          </div>
                          {setting.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {setting.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3">
                            {renderSettingInput(setting)}

                            {editingKey !== setting.key && (
                              <button
                                onClick={() => setEditingKey(setting.key)}
                                className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                Modifica
                              </button>
                            )}

                            {editingKey === setting.key && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSave(setting)}
                                  disabled={saving}
                                  className="px-4 py-2 text-sm bg-christmas-green text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                  {saving ? 'Salvataggio...' : 'Salva'}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingKey(null);
                                    fetchSettings(); // Reset changes
                                  }}
                                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                  Annulla
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {setting.updatedBy && setting.updatedAt && (
                        <p className="text-xs text-gray-500 mt-3">
                          Ultima modifica:{' '}
                          {new Date(setting.updatedAt).toLocaleString('it-IT')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* P2.3: Test Connections */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🔌</span>
            Test Connessioni
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Test Email */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">SMTP / Email</h3>
              <p className="text-sm text-gray-600 mb-3">
                Testa la connessione al server SMTP per l'invio di email
              </p>
              {testResults.email && (
                <div
                  className={`text-sm p-3 rounded-lg mb-3 ${
                    testResults.email.success
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {testResults.email.success ? '✅' : '❌'} {testResults.email.message}
                </div>
              )}
            </div>
            <button
              onClick={handleTestEmail}
              disabled={testingEmail}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingEmail ? 'Testing...' : 'Test Email'}
            </button>
          </div>

          {/* Test WhatsApp */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">Twilio / WhatsApp</h3>
              <p className="text-sm text-gray-600 mb-3">
                Testa la connessione a Twilio per l'invio di messaggi WhatsApp
              </p>
              {testResults.whatsapp && (
                <div
                  className={`text-sm p-3 rounded-lg mb-3 ${
                    testResults.whatsapp.success
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {testResults.whatsapp.success ? '✅' : '❌'} {testResults.whatsapp.message}
                </div>
              )}
            </div>
            <button
              onClick={handleTestWhatsApp}
              disabled={testingWhatsApp}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingWhatsApp ? 'Testing...' : 'Test WhatsApp'}
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3">
          <div className="text-2xl">ℹ️</div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Nota sulle Impostazioni
            </h3>
            <p className="text-sm text-blue-800">
              Le modifiche alle impostazioni vengono applicate immediatamente.
              Alcune impostazioni potrebbero richiedere il riavvio del sistema per
              avere effetto completo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
