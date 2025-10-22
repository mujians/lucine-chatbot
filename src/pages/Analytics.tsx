import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Ticket, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import type { DashboardStats } from '@/types';

export default function Analytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsApi.getDashboardStats();
      setStats(response.data || response);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Errore nel caricamento delle statistiche');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">Caricamento statistiche...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <p className="text-destructive">{error || 'Errore nel caricamento'}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Analytics"
          description="Panoramica delle prestazioni e statistiche del sistema"
        />

        <div className="space-y-6">
        {/* Chat Statistics */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Chat</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Totali
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.chats.total}</div>
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Attive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">{stats.chats.active}</div>
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In Attesa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-yellow-600">{stats.chats.waiting}</div>
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Chiuse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.chats.closed}</div>
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tickets Statistics */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Tickets</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Totali
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.tickets.total}</div>
                  <Ticket className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In Attesa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-yellow-600">{stats.tickets.pending}</div>
                  <Ticket className="h-5 w-5 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aperti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">{stats.tickets.open}</div>
                  <Ticket className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Risolti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">{stats.tickets.resolved}</div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Operators Statistics */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Operatori</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Totali
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.operators.total}</div>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Online
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">{stats.operators.online}</div>
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Disponibili
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">{stats.operators.available}</div>
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Tempo Medio di Risposta</CardTitle>
                <CardDescription>Tempo dall'inizio chat alla presa in carico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div className="text-2xl font-bold">
                    {stats.performance.avgResponseTimeMinutes !== null
                      ? `${stats.performance.avgResponseTimeMinutes} min`
                      : 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Tempo Medio di Risoluzione</CardTitle>
                <CardDescription>Tempo dalla creazione alla risoluzione ticket</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div className="text-2xl font-bold">
                    {stats.performance.avgResolutionTimeHours !== null
                      ? `${stats.performance.avgResolutionTimeHours.toFixed(1)} h`
                      : 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Performers */}
        {stats.operators.topPerformers.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Top Performers</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {stats.operators.topPerformers.map((performer, index) => (
                    <div
                      key={performer.id}
                      className="flex items-center justify-between pb-4 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {performer.chatsHandled} chat, {performer.ticketsHandled} tickets
                          </p>
                        </div>
                      </div>
                      {performer.averageRating && (
                        <div className="text-right">
                          <p className="font-semibold">{performer.averageRating.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">Rating</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}
