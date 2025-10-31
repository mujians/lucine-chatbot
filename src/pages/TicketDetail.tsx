import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ticketsApi } from '@/lib/api';
import { ArrowLeft, Mail, MessageSquare, User, Calendar, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Ticket {
  id: string;
  userName: string;
  email?: string;
  whatsappNumber?: string;
  contactMethod: string;
  status: string;
  priority: string;
  initialMessage: string;
  resolutionNotes?: string;
  createdAt: string;
  assignedAt?: string;
  resolvedAt?: string;
  operator?: {
    id: string;
    name: string;
  };
  session?: {
    id: string;
    userName: string;
    messages: any[];
  };
}

export default function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    if (!ticketId) return;

    try {
      setLoading(true);
      const response = await ticketsApi.getById(ticketId);
      setTicket(response.data);
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!ticket) return;

    try {
      setUpdating(true);
      await ticketsApi.assign(ticket.id, ''); // Backend auto-assigns to current operator
      await loadTicket();
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      alert('Errore nell\'assegnazione del ticket');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;

    try {
      setUpdating(true);
      await ticketsApi.updateStatus(ticket.id, { status: newStatus });
      await loadTicket();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Errore nell\'aggiornamento dello status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <p>Caricamento...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Button variant="ghost" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai Tickets
          </Button>
          <div className="mt-8 text-center">
            <p className="text-lg">Ticket non trovato</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const messages = ticket.session?.messages || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'RESOLVED': return 'bg-gray-100 text-gray-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'NORMAL': return 'bg-blue-100 text-blue-800';
      case 'LOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai Tickets
          </Button>

          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority}
            </Badge>
          </div>
        </div>

        {/* Ticket Info */}
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Ticket #{ticket.id.slice(0, 8)}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Utente:</span>
              <span>{ticket.userName}</span>
            </div>

            <div className="flex items-center gap-2">
              {ticket.contactMethod === 'EMAIL' ? (
                <Mail className="h-4 w-4 text-gray-500" />
              ) : (
                <MessageSquare className="h-4 w-4 text-gray-500" />
              )}
              <span className="font-medium">Contatto:</span>
              <span>{ticket.email || ticket.whatsappNumber}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Creato:</span>
              <span>{format(new Date(ticket.createdAt), 'PPp', { locale: it })}</span>
            </div>

            {ticket.operator && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Operatore:</span>
                <span>{ticket.operator.name}</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Messaggio iniziale:</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-md">
              {ticket.initialMessage}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {ticket.status === 'PENDING' && (
              <Button onClick={handleAssign} disabled={updating}>
                <User className="h-4 w-4 mr-2" />
                Assegna a me
              </Button>
            )}

            {(ticket.status === 'ASSIGNED' || ticket.status === 'PENDING') && (
              <Button onClick={() => handleStatusChange('IN_PROGRESS')} disabled={updating}>
                <Clock className="h-4 w-4 mr-2" />
                In Lavorazione
              </Button>
            )}

            {(ticket.status === 'IN_PROGRESS' || ticket.status === 'OPEN') && (
              <Button onClick={() => handleStatusChange('RESOLVED')} disabled={updating}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Risolvi
              </Button>
            )}

            {ticket.status === 'RESOLVED' && (
              <Button variant="outline" onClick={() => handleStatusChange('CLOSED')} disabled={updating}>
                Chiudi
              </Button>
            )}
          </div>
        </Card>

        {/* Chat History */}
        {messages.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Storia Conversazione</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((msg: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-md ${
                    msg.type === 'user'
                      ? 'bg-blue-50 ml-8'
                      : msg.type === 'system'
                      ? 'bg-gray-50 text-center text-sm'
                      : 'bg-green-50 mr-8'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {msg.type === 'user' ? 'Utente' : msg.type === 'system' ? 'Sistema' : 'Operatore'}
                      </p>
                      <p className="text-gray-800">{msg.content}</p>
                    </div>
                    {msg.timestamp && (
                      <span className="text-xs text-gray-400">
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Resolution Notes */}
        {ticket.resolutionNotes && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Note di Risoluzione</h2>
            <p className="text-gray-700">{ticket.resolutionNotes}</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
