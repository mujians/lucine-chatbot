import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, MessageSquare, User, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Rating {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  session: {
    id: string;
    userName: string | null;
  };
  operatorId: string | null;
  operatorName: string | null;
}

interface OperatorStat {
  operatorId: string;
  operatorName: string;
  totalRatings: number;
  sumRatings: number;
  averageRating: number;
}

interface RatingsData {
  totalRatings: number;
  averageRating: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  operatorStats: OperatorStat[];
  ratings: Rating[];
}

export default function Ratings() {
  const [data, setData] = useState<RatingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadRatings();
  }, [selectedOperator, startDate, endDate]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (selectedOperator && selectedOperator !== 'all') {
        params.operatorId = selectedOperator;
      }
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/chat/ratings/analytics', { params });
      const ratingsData = response.data.data || response.data;
      setData(ratingsData);
    } catch (err) {
      console.error('Failed to load ratings:', err);
      setError('Errore nel caricamento delle valutazioni');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getDistributionPercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">Caricamento valutazioni...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
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
          title="Valutazioni"
          description="Analisi delle valutazioni ricevute dai clienti"
        />

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Operatore</label>
                <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti gli operatori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli operatori</SelectItem>
                    {data.operatorStats.map((op) => (
                      <SelectItem key={op.operatorId} value={op.operatorId}>
                        {op.operatorName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Data inizio</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Data fine</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {(selectedOperator !== 'all' || startDate || endDate) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedOperator('all');
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  Reset Filtri
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valutazioni Totali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{data.totalRatings}</div>
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Media Valutazioni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{data.averageRating.toFixed(1)}</span>
                  {renderStars(Math.round(data.averageRating))}
                </div>
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Soddisfazione
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {data.totalRatings > 0
                    ? Math.round(
                        ((data.distribution[4] + data.distribution[5]) /
                          data.totalRatings) *
                          100
                      )
                    : 0}
                  %
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Valutazioni 4-5 stelle
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione Valutazioni</CardTitle>
            <CardDescription>Numero di valutazioni per stelle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = data.distribution[stars as keyof typeof data.distribution];
                const percentage = getDistributionPercentage(count, data.totalRatings);

                return (
                  <div key={stars} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-12">{stars} {renderStars(stars)}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          stars === 5
                            ? 'bg-green-500'
                            : stars === 4
                            ? 'bg-blue-500'
                            : stars === 3
                            ? 'bg-yellow-500'
                            : stars === 2
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Operator Stats */}
        {data.operatorStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Operatori</CardTitle>
              <CardDescription>Media valutazioni per operatore</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.operatorStats
                  .sort((a, b) => b.averageRating - a.averageRating)
                  .map((op) => (
                    <div
                      key={op.operatorId}
                      className="flex items-center justify-between pb-4 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{op.operatorName}</p>
                          <p className="text-sm text-muted-foreground">
                            {op.totalRatings} valutazioni
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            {op.averageRating.toFixed(1)}
                          </span>
                          {renderStars(Math.round(op.averageRating))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Ratings */}
        <Card>
          <CardHeader>
            <CardTitle>Valutazioni Recenti</CardTitle>
            <CardDescription>Ultime 50 valutazioni ricevute</CardDescription>
          </CardHeader>
          <CardContent>
            {data.ratings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nessuna valutazione trovata
              </p>
            ) : (
              <div className="space-y-4">
                {data.ratings.map((rating) => (
                  <div
                    key={rating.id}
                    className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div>{renderStars(rating.rating)}</div>
                        <div>
                          <p className="font-medium">
                            {rating.session.userName || 'Utente anonimo'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Operatore: {rating.operatorName || 'Non assegnato'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(rating.createdAt).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    {rating.comment && (
                      <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                        "{rating.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
