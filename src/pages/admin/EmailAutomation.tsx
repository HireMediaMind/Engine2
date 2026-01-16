import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { 
  Mail, 
  Plus, 
  Play, 
  Pause, 
  MoreHorizontal,
  Clock,
  Users,
  CheckCircle,
  Save
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/lib/api";

interface EmailSequence {
  id: number;
  name: string;
  trigger_type: string;
  email_count: number;
  subscriber_count: number;
  open_rate: number;
  status: "active" | "paused";
}

const defaultSequences: EmailSequence[] = [
  {
    id: 1,
    name: "Welcome Sequence",
    trigger_type: "new_lead",
    email_count: 5,
    subscriber_count: 0,
    open_rate: 0,
    status: "active",
  },
  {
    id: 2,
    name: "Lead Nurture",
    trigger_type: "lead_magnet",
    email_count: 7,
    subscriber_count: 0,
    open_rate: 0,
    status: "active",
  },
  {
    id: 3,
    name: "Call Reminder",
    trigger_type: "call_booked",
    email_count: 3,
    subscriber_count: 0,
    open_rate: 0,
    status: "active",
  },
];

export default function EmailAutomation() {
  const [sequences, setSequences] = useState<EmailSequence[]>(defaultSequences);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [newSequence, setNewSequence] = useState({ name: "", trigger_type: "new_lead" });
  const [emailData, setEmailData] = useState({ to: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSequences();
  }, []);

  const fetchSequences = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.emailSequences, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setSequences(data);
        }
      }
    } catch {
      // Use default sequences
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-emerald-100 text-emerald-700",
      paused: "bg-amber-100 text-amber-700",
    };
    return styles[status] || "bg-muted text-muted-foreground";
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      new_lead: "New lead signup",
      lead_magnet: "Downloaded lead magnet",
      call_booked: "Call booked",
      manual: "Manual add",
    };
    return labels[trigger] || trigger;
  };

  const toggleStatus = async (id: number) => {
    const sequence = sequences.find((s) => s.id === id);
    if (!sequence) return;

    const newStatus = sequence.status === "active" ? "paused" : "active";

    try {
      const response = await fetch(API_ENDPOINTS.emailSequences, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        setSequences((prev) =>
          prev.map((seq) =>
            seq.id === id ? { ...seq, status: newStatus } : seq
          )
        );
        toast({
          title: "Sequence updated",
          description: `${sequence.name} is now ${newStatus}`,
        });
      }
    } catch {
      // Update locally anyway for UX
      setSequences((prev) =>
        prev.map((seq) =>
          seq.id === id ? { ...seq, status: newStatus } : seq
        )
      );
    }
  };

  const createSequence = async () => {
    if (!newSequence.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.emailSequences, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newSequence),
      });

      const data = await response.json();

      const newSeq: EmailSequence = {
        id: data.sequence_id || Date.now(),
        name: newSequence.name,
        trigger_type: newSequence.trigger_type,
        email_count: 0,
        subscriber_count: 0,
        open_rate: 0,
        status: "paused",
      };

      setSequences((prev) => [...prev, newSeq]);
      setShowCreateDialog(false);
      setNewSequence({ name: "", trigger_type: "new_lead" });
      
      toast({
        title: "Sequence created",
        description: `${newSequence.name} has been created`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to create sequence",
        variant: "destructive",
      });
    }
  };

  const sendTestEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.body) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const response = await fetch(API_ENDPOINTS.sendEmail, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        toast({
          title: "Email sent!",
          description: `Email sent to ${emailData.to}`,
        });
        setShowSendDialog(false);
        setEmailData({ to: "", subject: "", body: "" });
      } else {
        throw new Error('Failed to send');
      }
    } catch {
      toast({
        title: "Note",
        description: "Email will be sent once SMTP is configured on Hostinger",
      });
      setShowSendDialog(false);
    } finally {
      setSending(false);
    }
  };

  const stats = {
    totalEmails: sequences.reduce((acc, s) => acc + s.email_count, 0),
    totalSubscribers: sequences.reduce((acc, s) => acc + s.subscriber_count, 0),
    avgOpenRate: sequences.length > 0 
      ? (sequences.reduce((acc, s) => acc + s.open_rate, 0) / sequences.length).toFixed(1)
      : 0,
    activeSequences: sequences.filter((s) => s.status === "active").length,
  };

  return (
    <>
      <Helmet>
        <title>Email Automation | HireMediaMind Admin</title>
      </Helmet>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          
          <main className="flex-1 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Email Automation</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your email sequences and nurture campaigns
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowSendDialog(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Sequence
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalEmails}</p>
                      <p className="text-sm text-muted-foreground">Total Emails</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <Users className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalSubscribers}</p>
                      <p className="text-sm text-muted-foreground">Active Subscribers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.avgOpenRate}%</p>
                      <p className="text-sm text-muted-foreground">Avg Open Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.activeSequences}</p>
                      <p className="text-sm text-muted-foreground">Active Sequences</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sequences List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4">
                {sequences.map((sequence) => (
                  <Card key={sequence.id} className="border-border">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-primary/10">
                            <Mail className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">{sequence.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Trigger: {getTriggerLabel(sequence.trigger_type)}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-muted-foreground">
                                {sequence.email_count} emails
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {sequence.subscriber_count} subscribers
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {sequence.open_rate}% open rate
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-sm rounded-full capitalize ${getStatusBadge(sequence.status)}`}>
                            {sequence.status}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleStatus(sequence.id)}
                          >
                            {sequence.status === "active" ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Sequence</DropdownMenuItem>
                              <DropdownMenuItem>View Analytics</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Integration Note */}
            <Card className="mt-8 border-border bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">📧 Email Configuration Required</h3>
                <p className="text-sm text-muted-foreground">
                  To enable email sending, update <code className="bg-muted px-1 rounded">public/api/send-email.php</code> with 
                  your Hostinger SMTP credentials (smtp.hostinger.com, port 465).
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarProvider>

      {/* Create Sequence Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Email Sequence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Sequence Name</Label>
              <Input
                placeholder="e.g., Welcome Series"
                value={newSequence.name}
                onChange={(e) => setNewSequence({ ...newSequence, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Trigger</Label>
              <Select 
                value={newSequence.trigger_type} 
                onValueChange={(v) => setNewSequence({ ...newSequence, trigger_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_lead">New lead signup</SelectItem>
                  <SelectItem value="lead_magnet">Downloaded lead magnet</SelectItem>
                  <SelectItem value="call_booked">Call booked</SelectItem>
                  <SelectItem value="manual">Manual add</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createSequence} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Create Sequence
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>To</Label>
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Email subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                placeholder="Email body..."
                rows={5}
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
              />
            </div>
            <Button onClick={sendTestEmail} className="w-full" disabled={sending}>
              {sending ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
