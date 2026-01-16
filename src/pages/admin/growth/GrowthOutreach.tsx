
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GrowthService, Workflow } from "@/lib/growth-service";
import { Send, Mail, MessageSquare, Loader2, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

export default function GrowthOutreach() {
    const [loading, setLoading] = useState(false);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");

    const [formData, setFormData] = useState({
        type: "email",
        subject: "",
        template: "",
        listId: ""
    });

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            const data = await GrowthService.getWorkflows('Outreach');
            const active = data.filter((w: Workflow) => w.is_active);
            setWorkflows(active);
            if (active.length > 0) setSelectedWorkflowId(active[0].id.toString());
        } catch (e) { console.error("Failed to load workflows"); }
    };

    const handleSend = async () => {
        if (!selectedWorkflowId) return;
        setLoading(true);
        try {
            await GrowthService.triggerWorkflow(parseInt(selectedWorkflowId), formData);
            toast({ title: "Outreach Started", description: "Messages are being queued." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <AdminSidebar />
                <main className="flex-1 p-6 lg:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Outreach Automation</h1>
                        <p className="text-muted-foreground">Cold email and WhatsApp broadcasting.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Send className="h-5 w-5 text-primary" />
                                    Campaign Composer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">

                                {workflows.length === 0 ? (
                                    <div className="p-4 border border-amber-200 bg-amber-50 rounded text-amber-800 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-sm">No active 'Outreach' workflows found. Register one in Embed Manager.</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>Select Backend Workflow</Label>
                                        <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                                            <SelectTrigger><SelectValue placeholder="Select workflow..." /></SelectTrigger>
                                            <SelectContent>
                                                {workflows.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Channel</Label>
                                    <div className="flex gap-4">
                                        <Button
                                            variant={formData.type === 'email' ? 'default' : 'outline'}
                                            onClick={() => setFormData({ ...formData, type: 'email' })}
                                            className="flex-1"
                                        >
                                            <Mail className="h-4 w-4 mr-2" /> Email
                                        </Button>
                                        <Button
                                            variant={formData.type === 'whatsapp' ? 'default' : 'outline'}
                                            onClick={() => setFormData({ ...formData, type: 'whatsapp' })}
                                            className="flex-1"
                                        >
                                            <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
                                        </Button>
                                    </div>
                                </div>

                                {formData.type === 'email' && (
                                    <div className="space-y-2">
                                        <Label>Subject Line</Label>
                                        <Input
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Message Template</Label>
                                    <Textarea
                                        className="min-h-[200px] font-mono text-sm"
                                        placeholder="Hi {{firstName}}, ..."
                                        value={formData.template}
                                        onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Target List ID</Label>
                                    <Input
                                        placeholder="List ID from Leads Database"
                                        value={formData.listId}
                                        onChange={(e) => setFormData({ ...formData, listId: e.target.value })}
                                    />
                                </div>

                                <Button onClick={handleSend} disabled={loading || workflows.length === 0} className="w-full">
                                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                                    Start Broadcast
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
