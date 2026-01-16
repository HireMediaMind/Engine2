import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  useClientPreviews,
  useCreateClientPreview,
  useDeleteClientPreview,
  ClientPreview
} from "@/hooks/useClientPreviews";
import {
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Link2
} from "lucide-react";

const ClientPreviews = () => {
  const { data: previews, isLoading } = useClientPreviews();
  const createPreview = useCreateClientPreview();
  const deletePreview = useDeleteClientPreview();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPreview, setNewPreview] = useState({
    client_name: "",
    client_email: "",
    title: "",
    description: "",
    preview_type: "chatbot",
    expires_days: "30",
    chatbot_greeting: "Hello! How can I help you today?",
    chatbot_capabilities: "",
    chatbot_webhook: ""
  });

  const handleCreate = async () => {
    if (!newPreview.client_name || !newPreview.title) {
      toast.error("Client name and title are required");
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(newPreview.expires_days));

    try {
      await createPreview.mutateAsync({
        client_name: newPreview.client_name,
        client_email: newPreview.client_email || null,
        title: newPreview.title,
        description: newPreview.description || null,
        preview_type: newPreview.preview_type,
        expires_at: expiresAt.toISOString(),
        chatbot_config: {
          greeting: newPreview.chatbot_greeting,
          capabilities: newPreview.chatbot_capabilities.split(",").map(s => s.trim()).filter(Boolean),
          webhook_url: newPreview.chatbot_webhook
        }
      });

      toast.success("Preview created successfully!");
      setIsCreateOpen(false);
      setNewPreview({
        client_name: "",
        client_email: "",
        title: "",
        description: "",
        preview_type: "chatbot",
        expires_days: "30",
        chatbot_greeting: "Hello! How can I help you today?",
        chatbot_capabilities: "",
        chatbot_webhook: ""
      });
    } catch (err) {
      toast.error("Failed to create preview");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this preview? The link will no longer work.")) return;

    try {
      await deletePreview.mutateAsync(id);
      toast.success("Preview deleted");
    } catch (err) {
      toast.error("Failed to delete preview");
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/preview/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Preview link copied to clipboard!");
  };

  const getStatusBadge = (preview: ClientPreview) => {
    const isExpired = preview.expires_at && new Date(preview.expires_at) < new Date();

    if (isExpired) {
      return <Badge variant="destructive"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
    }

    switch (preview.status) {
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "changes_requested":
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Changes Requested</Badge>;
      default:
        return <Badge variant="outline"><Eye className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Client Preview Workspaces</h1>
              <p className="text-muted-foreground mt-1">
                Manage private preview links for client demonstrations
              </p>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Client Preview</DialogTitle>
                  <DialogDescription>
                    Generate a private preview link for your client
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client_name">Client Name *</Label>
                      <Input
                        id="client_name"
                        value={newPreview.client_name}
                        onChange={(e) => setNewPreview({ ...newPreview, client_name: e.target.value })}
                        placeholder="ABC Corporation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client_email">Client Email</Label>
                      <Input
                        id="client_email"
                        type="email"
                        value={newPreview.client_email}
                        onChange={(e) => setNewPreview({ ...newPreview, client_email: e.target.value })}
                        placeholder="client@company.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Automation Title *</Label>
                    <Input
                      id="title"
                      value={newPreview.title}
                      onChange={(e) => setNewPreview({ ...newPreview, title: e.target.value })}
                      placeholder="AI Customer Support Chatbot"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newPreview.description}
                      onChange={(e) => setNewPreview({ ...newPreview, description: e.target.value })}
                      placeholder="Describe the automation..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Preview Type</Label>
                      <Select
                        value={newPreview.preview_type}
                        onValueChange={(v) => setNewPreview({ ...newPreview, preview_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chatbot">Chatbot</SelectItem>
                          <SelectItem value="workflow">Workflow</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp Bot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Link Expires In</Label>
                      <Select
                        value={newPreview.expires_days}
                        onValueChange={(v) => setNewPreview({ ...newPreview, expires_days: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {newPreview.preview_type === "chatbot" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="greeting">Chatbot Greeting</Label>
                        <Textarea
                          id="greeting"
                          value={newPreview.chatbot_greeting}
                          onChange={(e) => setNewPreview({ ...newPreview, chatbot_greeting: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="capabilities">Capabilities (comma-separated)</Label>
                        <Input
                          id="capabilities"
                          value={newPreview.chatbot_capabilities}
                          onChange={(e) => setNewPreview({ ...newPreview, chatbot_capabilities: e.target.value })}
                          placeholder="FAQ, Support Tickets, Product Info"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webhook">n8n Webhook URL (Optional)</Label>
                        <Input
                          id="webhook"
                          value={newPreview.chatbot_webhook}
                          onChange={(e) => setNewPreview({ ...newPreview, chatbot_webhook: e.target.value })}
                          placeholder="https://primary.n8n.cloud/webhook/..."
                          className="font-mono text-xs"
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave empty to use mock responses.
                        </p>
                      </div>
                    </>
                  )}

                  <Button onClick={handleCreate} className="w-full" disabled={createPreview.isPending}>
                    {createPreview.isPending ? "Creating..." : "Create Preview Link"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-muted-foreground">Loading previews...</div>
          ) : !previews?.length ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Link2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No preview workspaces yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first preview to share with clients
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {previews.map((preview) => (
                <Card key={preview.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{preview.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {preview.client_name}
                          {preview.client_email && ` • ${preview.client_email}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(preview)}
                        <Badge variant="outline" className="capitalize">{preview.preview_type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {preview.description && (
                      <p className="text-sm text-muted-foreground mb-4">{preview.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>Created: {new Date(preview.created_at).toLocaleDateString()}</span>
                      {preview.expires_at && (
                        <span>Expires: {new Date(preview.expires_at).toLocaleDateString()}</span>
                      )}
                      {preview.viewed_at && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Viewed: {new Date(preview.viewed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {preview.feedback && (
                      <div className="bg-muted p-3 rounded-md mb-4">
                        <p className="text-sm font-medium">Client Feedback:</p>
                        <p className="text-sm text-muted-foreground">{preview.feedback}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyLink(preview.token)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/preview/${preview.token}`, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Preview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(preview.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ClientPreviews;
