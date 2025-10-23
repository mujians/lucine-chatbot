import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { healthApi } from '@/lib/api';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  AlertCircle,
  CheckCircle,
  Database,
  Users,
  MessageSquare,
  Ticket,
  Activity,
  Settings,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  message?: string;
  warning?: string;
  error?: string;
  [key: string]: any;
}

interface SystemHealth {
  timestamp: string;
  status: 'healthy' | 'unhealthy';
  message: string;
  checks: {
    database?: HealthCheck;
    operators?: HealthCheck & {
      total: number;
      online: number;
      available: number;
      details: Array<{
        id: string;
        name: string;
        email: string;
        isOnline: boolean;
        isAvailable: boolean;
        lastSeenAt: string;
      }>;
    };
    chatSessions?: HealthCheck & {
      total: number;
      active: number;
      waiting: number;
    };
    tickets?: HealthCheck & {
      total: number;
      open: number;
      assigned: number;
    };
    recentActivity?: HealthCheck & {
      period: string;
      chats: number;
      tickets: number;
    };
    configuration?: HealthCheck & {
      environment: string;
      jwtConfigured: boolean;
      openaiConfigured: boolean;
      databaseConfigured: boolean;
    };
    migrations?: HealthCheck & {
      isAvailableColumn: string;
    };
  };
}

export default function SystemStatus() {
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealthData = async () => {
    try {
      setRefreshing(true);
      const response = await healthApi.getSystemHealth();
      setHealthData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Errore nel recupero dei dati di sistema');
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    if (status === 'healthy') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'healthy') {
      return <Badge className="bg-green-500">Healthy</Badge>;
    }
    return <Badge variant="destructive">Unhealthy</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <PageHeader
            title="System Status"
            description="Stato del sistema e controlli di integrità"
          />
          <div className="mt-6 text-center text-muted-foreground">
            Caricamento stato del sistema...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <PageHeader
            title="System Status"
            description="Stato del sistema e controlli di integrità"
          />
          <div className="mt-6">
            <Card className="border-red-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-500">
                  <AlertCircle className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">Errore nel caricamento</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
                <Button onClick={fetchHealthData} className="mt-4">
                  Riprova
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="System Status"
            description="Stato del sistema e controlli di integrità"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealthData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
        </div>

        {/* Overall Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(healthData?.status || 'unhealthy')}
                <div>
                  <CardTitle>Stato Generale</CardTitle>
                  <CardDescription>
                    {healthData?.message || 'Stato sconosciuto'}
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(healthData?.status || 'unhealthy')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Ultimo aggiornamento:{' '}
              {healthData?.timestamp &&
                format(new Date(healthData.timestamp), 'dd MMMM yyyy HH:mm:ss', {
                  locale: it,
                })}
            </div>
          </CardContent>
        </Card>

        {/* Database Check */}
        {healthData?.checks.database && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Database</CardTitle>
                  <CardDescription>Connettività database PostgreSQL</CardDescription>
                </div>
                {getStatusBadge(healthData.checks.database.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {healthData.checks.database.message || healthData.checks.database.error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Operators Status */}
        {healthData?.checks.operators && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Operatori</CardTitle>
                  <CardDescription>Stato operatori del sistema</CardDescription>
                </div>
                {getStatusBadge(healthData.checks.operators.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold">{healthData.checks.operators.total}</div>
                  <div className="text-sm text-muted-foreground">Totali</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {healthData.checks.operators.online}
                  </div>
                  <div className="text-sm text-muted-foreground">Online</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {healthData.checks.operators.available}
                  </div>
                  <div className="text-sm text-muted-foreground">Disponibili</div>
                </div>
              </div>

              {healthData.checks.operators.warning && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    {healthData.checks.operators.warning}
                  </span>
                </div>
              )}

              {healthData.checks.operators.details && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Dettaglio Operatori</h4>
                  <div className="space-y-2">
                    {healthData.checks.operators.details.map((op) => (
                      <div
                        key={op.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{op.name}</span>
                            <span className="text-xs text-muted-foreground">{op.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={op.isOnline ? 'default' : 'secondary'}>
                            {op.isOnline ? 'Online' : 'Offline'}
                          </Badge>
                          <Badge
                            variant={op.isAvailable ? 'default' : 'outline'}
                            className={op.isAvailable ? 'bg-green-500' : ''}
                          >
                            {op.isAvailable ? 'Disponibile' : 'Non Disponibile'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chat Sessions */}
        {healthData?.checks.chatSessions && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Sessioni Chat</CardTitle>
                  <CardDescription>Stato delle conversazioni in corso</CardDescription>
                </div>
                {getStatusBadge(healthData.checks.chatSessions.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold">{healthData.checks.chatSessions.total}</div>
                  <div className="text-sm text-muted-foreground">Totali</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {healthData.checks.chatSessions.active}
                  </div>
                  <div className="text-sm text-muted-foreground">Attive</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {healthData.checks.chatSessions.waiting}
                  </div>
                  <div className="text-sm text-muted-foreground">In Attesa</div>
                </div>
              </div>

              {healthData.checks.chatSessions.warning && (
                <div className="flex items-center gap-2 p-3 mt-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    {healthData.checks.chatSessions.warning}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tickets */}
        {healthData?.checks.tickets && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Ticket</CardTitle>
                  <CardDescription>Stato dei ticket di supporto</CardDescription>
                </div>
                {getStatusBadge(healthData.checks.tickets.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold">{healthData.checks.tickets.total}</div>
                  <div className="text-sm text-muted-foreground">Totali</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {healthData.checks.tickets.open}
                  </div>
                  <div className="text-sm text-muted-foreground">Aperti</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {healthData.checks.tickets.assigned}
                  </div>
                  <div className="text-sm text-muted-foreground">Assegnati</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {healthData?.checks.recentActivity && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Attività Recente</CardTitle>
                  <CardDescription>
                    {healthData.checks.recentActivity.period}
                  </CardDescription>
                </div>
                {getStatusBadge(healthData.checks.recentActivity.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">
                    {healthData.checks.recentActivity.chats}
                  </div>
                  <div className="text-sm text-muted-foreground">Chat create</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {healthData.checks.recentActivity.tickets}
                  </div>
                  <div className="text-sm text-muted-foreground">Ticket creati</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration */}
        {healthData?.checks.configuration && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Configurazione</CardTitle>
                  <CardDescription>Stato della configurazione del sistema</CardDescription>
                </div>
                {getStatusBadge(healthData.checks.configuration.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm">Environment</span>
                  <Badge variant="outline">{healthData.checks.configuration.environment}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm">JWT</span>
                  {healthData.checks.configuration.jwtConfigured ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm">OpenAI</span>
                  {healthData.checks.configuration.openaiConfigured ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm">Database</span>
                  {healthData.checks.configuration.databaseConfigured ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Migrations */}
        {healthData?.checks.migrations && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Migrazioni Database</CardTitle>
                  <CardDescription>Stato delle migrazioni del database</CardDescription>
                </div>
                {getStatusBadge(healthData.checks.migrations.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm">Colonna isAvailable</span>
                  <Badge
                    variant={
                      healthData.checks.migrations.isAvailableColumn === 'exists'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {healthData.checks.migrations.isAvailableColumn}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {healthData.checks.migrations.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
