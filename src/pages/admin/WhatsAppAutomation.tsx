import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  MessageSquare, 
  Plus, 
  Play, 
  Pause, 
  MoreHorizontal,
  Send,
  Users,
  CheckCircle,
  Phone,
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
import { API_BASE_URL } from "@/lib/api";

interface WhatsAppFlow {
  id: number;
  name: string;
  trigger: string;
  messages: number;
  recipients: number;
  deliveryRate: number;
  status: "active" | "paused";
}

const defaultFlows: WhatsAppFlow[] = [
  {
    id: 1,
    name: "Lead Welcome Message",
    trigger: "New contact form submission",
    messages: 1,
    recipients: 0,
    deliveryRate: 98.5,
    status: "active",
  },
  {
    id: 2,
    name: "Call Reminder (24h before)",
    trigger: "Call booked - 24h before",
    messages: 1,
    recipients: 0,
    deliveryRate: 99.1,
    status: "active",
  },
  {
    id: 3,
    name: "Post-Call Follow-up",
    trigger: "Call completed",
    messages: 2,
    recipients: 0,
    deliveryRate: 97.2,
    status: "active",
  },
];

export default function WhatsAppAutomation() {
  const [flows, setFlows] = useState<WhatsAppFlow[]>(defaultFlows);
  const [loading, setLoading] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [messageData, setMessageData] = useState({ phone: "", message: "" });
  const [newFlow, setNewFlow] = useState({ name: "", trigger: "form_submission" });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-emerald-100 text-emerald-700",
      paused: "bg-amber-100 text-amber-700",
    };
    return styles[status] || "bg-muted text-muted-foreground";
  };

  const toggleStatus = (id: number) => {
    setFlows((prev) =>
      prev.map((flow) =>
        flow.id === id
          ? { ...flow, status: flow.status === "active" ? "paused" : "active" }
          : flow
      )
    );
    toast({
      title: "Status updated",
      description: "Flow status has been changed",
    });
  };

  const createFlow = () => {
    if (!newFlow.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    const triggerLabels: Record<string, string> = {
      form_submission: "New contact form submission",
      lead_magnet: "Lead magnet download",
      call_booked: "Call booked",
      call_reminder: "Call reminder (24h before)",
      manual: "Manual trigger",
    };

    const newFlowData: WhatsAppFlow = {
      id: Date.now(),
      name: newFlow.name,
      trigger: triggerLabels[newFlow.trigger] || newFlow.trigger,
      messages: 1,
      recipients: 0,
      deliveryRate: 0,
      status: "paused",
    };

    setFlows((prev) => [...prev, newFlowData]);
    setShowCreateDialog(false);
    setNewFlow({ name: "", trigger: "form_submission" });
    
    toast({
      title: "Flow created",
      description: `${newFlow.name} has been created`,
    });
  };

  const sendWhatsAppMessage = async () => {
    if (!messageData.phone || !messageData.message) {
      toast({ title: "Error", description: "Phone and message are required", variant: "destructive" });
      return;
    }

    setSending(true);

    // Clean phone number
    const cleanPhone = messageData.phone.replace(/[^0-9]/g, '');
    
    // Try API first (for WhatsApp Business API integration)
    try {
      const response = await fetch(`${API_BASE_URL}/whatsapp-webhook.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: cleanPhone, message: messageData.message }),
      });

      if (response.ok) {
        toast({
          title: "Message sent!",
          description: `WhatsApp message sent to ${cleanPhone}`,
        });
        setShowSendDialog(false);
        setMessageData({ phone: "", message: "" });
        setSending(false);
        return;
      }
    } catch {
      // API not configured, use fallback
    }

    // Fallback: Open WhatsApp Web
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageData.message)}`;
    window.open(whatsappUrl, "_blank");
    
    toast({
      title: "WhatsApp opened",
      description: "Complete sending the message in WhatsApp",
    });
    
    setShowSendDialog(false);
    setMessageData({ phone: "", message: "" });
    setSending(false);
  };

  const stats = {
    totalMessages: flows.reduce((acc, f) => acc + f.messages, 0),
    totalRecipients: flows.reduce((acc, f) => acc + f.recipients, 0),
    avgDeliveryRate: flows.length > 0 
      ? (flows.reduce((acc, f) => acc + f.deliveryRate, 0) / flows.length).toFixed(1)
      : 0,
    activeFlows: flows.filter((f) => f.status === "active").length,
  };

  return (
    <>
      <Helmet>
        <title>WhatsApp Automation | HireMediaMind Admin</title>
      </Helmet>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          
          <main className="flex-1 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">WhatsApp Automation</h1>
                <p className="text-muted-foreground mt-1">
                  Automate WhatsApp messages for leads and reminders
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowSendDialog(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Flow
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <MessageSquare className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalMessages}</p>
                      <p className="text-sm text-muted-foreground">Total Messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalRecipients}</p>
                      <p className="text-sm text-muted-foreground">Total Recipients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Send className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.activeFlows}</p>
                      <p className="text-sm text-muted-foreground">Active Flows</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <CheckCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.avgDeliveryRate}%</p>
                      <p className="text-sm text-muted-foreground">Delivery Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Flows List */}
            <div className="grid gap-4">
              {flows.map((flow) => (
                <Card key={flow.id} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-emerald-100">
                          <MessageSquare className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{flow.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Trigger: {flow.trigger}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-muted-foreground">
                              {flow.messages} {flow.messages === 1 ? "message" : "messages"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {flow.recipients} recipients
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {flow.deliveryRate}% delivered
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-sm rounded-full capitalize ${getStatusBadge(flow.status)}`}>
                          {flow.status}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleStatus(flow.id)}
                        >
                          {flow.status === "active" ? (
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
                            <DropdownMenuItem>Edit Flow</DropdownMenuItem>
                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                            <DropdownMenuItem>Test Message</DropdownMenuItem>
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

            {/* Integration Note */}
            <Card className="mt-8 border-border bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">📱 WhatsApp Business API</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For fully automated messaging, configure the WhatsApp Business API in 
                  <code className="bg-muted px-1 mx-1 rounded">public/api/whatsapp-webhook.php</code>
                  with your Meta Business credentials.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Current mode:</strong> Manual sending via WhatsApp Web links.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarProvider>

      {/* Send Message Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="+91 84298 89303"
                  value={messageData.phone}
                  onChange={(e) => setMessageData({ ...messageData, phone: e.target.value })}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Include country code (e.g., +91)</p>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                placeholder="Type your message..."
                rows={4}
                value={messageData.message}
                onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
              />
            </div>
            <Button onClick={sendWhatsAppMessage} className="w-full" disabled={sending}>
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send via WhatsApp"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Flow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create WhatsApp Flow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Flow Name</Label>
              <Input
                placeholder="e.g., Welcome Message"
                value={newFlow.name}
                onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Trigger</Label>
              <Select 
                value={newFlow.trigger} 
                onValueChange={(v) => setNewFlow({ ...newFlow, trigger: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form_submission">New contact form submission</SelectItem>
                  <SelectItem value="lead_magnet">Lead magnet download</SelectItem>
                  <SelectItem value="call_booked">Call booked</SelectItem>
                  <SelectItem value="call_reminder">Call reminder (24h before)</SelectItem>
                  <SelectItem value="manual">Manual trigger</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createFlow} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Create Flow
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
