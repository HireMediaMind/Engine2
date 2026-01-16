import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import AuthGuard from '@/components/admin/AuthGuard';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { MessageSquare, User, Mail, MapPin, Star, Trash2, Eye, Calendar, CheckCircle, Clock } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface ChatSession {
  id: number;
  session_id: string;
  lead_name: string | null;
  lead_email: string | null;
  lead_location: string | null;
  lead_interest: string | null;
  lead_timezone: string | null;
  conversation_stage: string;
  lead_score: number;
  is_qualified: boolean;
  booking_date: string | null;
  booking_confirmed: boolean;
  deal_confirmed: boolean;
  deal_service: string | null;
  deal_price: number | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

interface SessionDetail extends ChatSession {
  messages: ChatMessage[];
}

export default function ChatbotSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/sessions.php?filter=${filter}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load chat sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const viewSession = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/sessions.php?id=${id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setSelectedSession(data.session);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      toast.error('Failed to load session details');
    }
  };

  const deleteSession = async (id: number) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/sessions.php?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Session deleted');
        fetchSessions();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  const stats = {
    total: sessions.length,
    qualified: sessions.filter(s => s.is_qualified).length,
    deals: sessions.filter(s => s.deal_confirmed).length,
    withEmail: sessions.filter(s => s.lead_email).length
  };

  return (
    <AuthGuard>
      <Helmet>
        <title>Chat Sessions | Admin</title>
      </Helmet>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar />
          <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Chat Sessions</h1>
            <p className="text-muted-foreground mt-1">View and manage chatbot conversations</p>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-blue-500/10 p-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.withEmail}</p>
                  <p className="text-sm text-muted-foreground">Leads Captured</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-amber-500/10 p-3">
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.qualified}</p>
                  <p className="text-sm text-muted-foreground">Qualified Leads</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-green-500/10 p-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.deals}</p>
                  <p className="text-sm text-muted-foreground">Deals Confirmed</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter sessions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="with_email">With Email</SelectItem>
                <SelectItem value="qualified">Qualified Leads</SelectItem>
                <SelectItem value="deals">Confirmed Deals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sessions List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : sessions.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No chat sessions yet</h3>
              <p className="text-muted-foreground">
                Sessions will appear here when visitors interact with your chatbot
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {session.lead_name || 'Anonymous Visitor'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.lead_email || 'No email captured'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {session.lead_location && (
                            <Badge variant="outline" className="gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.lead_location}
                            </Badge>
                          )}
                          {session.lead_interest && (
                            <Badge variant="secondary">
                              {session.lead_interest}
                            </Badge>
                          )}
                          <Badge variant="outline" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {session.message_count} messages
                          </Badge>
                          <Badge variant="outline" className={`gap-1 ${getScoreColor(session.lead_score)}`}>
                            <Star className="h-3 w-3" />
                            Score: {session.lead_score}
                          </Badge>
                          {session.is_qualified && (
                            <Badge className="bg-amber-500/10 text-amber-500">Qualified</Badge>
                          )}
                          {session.deal_confirmed && (
                            <Badge className="bg-green-500/10 text-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Deal Confirmed
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(session.created_at)}
                          </span>
                          {session.lead_timezone && (
                            <span>TZ: {session.lead_timezone}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => viewSession(session.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteSession(session.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Session Detail Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Chat Session Details</DialogTitle>
                <DialogDescription>
                  {selectedSession?.lead_name || 'Anonymous'} - {selectedSession?.lead_email || 'No email'}
                </DialogDescription>
              </DialogHeader>
              
              {selectedSession && (
                <div className="space-y-4">
                  {/* Lead Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedSession.lead_location || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Interest</p>
                      <p className="font-medium">{selectedSession.lead_interest || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lead Score</p>
                      <p className={`font-medium ${getScoreColor(selectedSession.lead_score)}`}>
                        {selectedSession.lead_score}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <div className="flex gap-2">
                        {selectedSession.is_qualified && <Badge className="bg-amber-500/10 text-amber-500">Qualified</Badge>}
                        {selectedSession.deal_confirmed && <Badge className="bg-green-500/10 text-green-500">Deal</Badge>}
                      </div>
                    </div>
                  </div>
                  
                  {/* Conversation */}
                  <div>
                    <p className="text-sm font-medium mb-2">Conversation</p>
                    <ScrollArea className="h-64 rounded-lg border p-4">
                      <div className="space-y-4">
                        {selectedSession.messages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className="text-[10px] opacity-60 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
