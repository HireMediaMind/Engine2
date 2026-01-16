
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GrowthService, Workflow } from "@/lib/growth-service";
import { Plus, Play, Trash2, Power, Code2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function EmbedManager() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newWorkflow, setNewWorkflow] = useState<Partial<Workflow>>({ category: 'Custom', is_active: 1 });

    // Test Dialog State
    const [testPayload, setTestPayload] = useState('{\n  "test": true\n}');
    const [activeTestId, setActiveTestId] = useState<number | null>(null);
    const [testLoading, setTestLoading] = useState(false);
    const [testResponse, setTestResponse] = useState<string | null>(null);

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            setLoading(true);
            const data = await GrowthService.getWorkflows();
            setWorkflows(data);
        } catch (e) {
            toast({ title: "Error", description: "Failed to load workflows", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newWorkflow.name || !newWorkflow.webhook_path) return;
        try {
            await GrowthService.createWorkflow(newWorkflow);
            setIsCreateOpen(false);
            loadWorkflows();
            toast({ title: "Success", description: "Workflow registered" });
        } catch (e) {
            toast({ title: "Error", description: "Failed to create workflow", variant: "destructive" });
        }
    };

    const handleToggle = async (id: number, currentStatus: number) => {
        try {
            await GrowthService.toggleWorkflow(id, currentStatus === 0);
            loadWorkflows();
        } catch (e) {
            toast({ title: "Error", description: "Update failed", variant: "destructive" });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            await GrowthService.deleteWorkflow(id);
            loadWorkflows();
            toast({ title: "Deleted", description: "Workflow removed" });
        } catch (e) {
            toast({ title: "Error", description: "Delete failed", variant: "destructive" });
        }
    };

    const runTest = async () => {
        if (!activeTestId) return;
        setTestLoading(true);
        setTestResponse(null);
        try {
            const payload = JSON.parse(testPayload);
            const res = await GrowthService.triggerWorkflow(activeTestId, payload);
            setTestResponse(JSON.stringify(res, null, 2));
            toast({ title: "Execution Successful", description: "Check response below." });
        } catch (e: any) {
            setTestResponse("Error: " + e.message);
            toast({ title: "Execution Failed", description: e.message, variant: "destructive" });
        } finally {
            setTestLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <AdminSidebar />
                <main className="flex-1 p-6 lg:p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Embed Manager</h1>
                            <p className="text-muted-foreground">Manage and route your internal n8n workflows.</p>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="h-4 w-4 mr-2" /> Register Workflow</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Register New Workflow</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            placeholder="e.g. LinkedIn Scraper v2"
                                            value={newWorkflow.name || ''}
                                            onChange={e => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select onValueChange={(v: any) => setNewWorkflow({ ...newWorkflow, category: v })} defaultValue="Custom">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Leads">Leads</SelectItem>
                                                <SelectItem value="Outreach">Outreach</SelectItem>
                                                <SelectItem value="Ads">Ads</SelectItem>
                                                <SelectItem value="Custom">Custom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Webhook Path (n8n)</Label>
                                        <Input
                                            placeholder="e.g. my-webhook-slug"
                                            value={newWorkflow.webhook_path || ''}
                                            onChange={e => setNewWorkflow({ ...newWorkflow, webhook_path: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">Only the path slug, not the full URL.</p>
                                    </div>
                                    <Button onClick={handleCreate} className="w-full">Register</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Webhook Path</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                                    ) : workflows.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No workflows registered.</TableCell></TableRow>
                                    ) : (
                                        workflows.map((wf) => (
                                            <TableRow key={wf.id}>
                                                <TableCell>
                                                    <Switch
                                                        checked={wf.is_active === 1}
                                                        onCheckedChange={() => handleToggle(wf.id, wf.is_active)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{wf.name}</TableCell>
                                                <TableCell><Badge variant="outline">{wf.category}</Badge></TableCell>
                                                <TableCell className="font-mono text-xs">{wf.webhook_path}</TableCell>
                                                <TableCell className="text-right flex justify-end gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" onClick={() => setActiveTestId(wf.id)}>
                                                                <Play className="h-4 w-4 text-emerald-500" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-lg">
                                                            <DialogHeader><DialogTitle>Test: {wf.name}</DialogTitle></DialogHeader>
                                                            <div className="space-y-4">
                                                                <Label>JSON Payload</Label>
                                                                <Textarea
                                                                    className="font-mono h-32"
                                                                    value={testPayload}
                                                                    onChange={e => setTestPayload(e.target.value)}
                                                                />
                                                                <Button onClick={runTest} disabled={testLoading} className="w-full">
                                                                    {testLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Code2 className="h-4 w-4 mr-2" />}
                                                                    Run Test
                                                                </Button>
                                                                {testResponse && (
                                                                    <div className="mt-4 bg-muted p-4 rounded-md overflow-auto max-h-60 text-xs font-mono">
                                                                        <pre>{testResponse}</pre>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(wf.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </SidebarProvider>
    );
}
