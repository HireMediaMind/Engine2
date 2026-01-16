
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GrowthService, Workflow } from "@/lib/growth-service";
import { MousePointerClick, Zap, Loader2, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

export default function GrowthAds() {
    const [loading, setLoading] = useState(false);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");

    const [formData, setFormData] = useState({
        platform: "facebook",
        budget: "50",
        objective: "leads",
        prompt: "",
        url: ""
    });

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            const data = await GrowthService.getWorkflows('Ads');
            const active = data.filter((w: Workflow) => w.is_active);
            setWorkflows(active);
            if (active.length > 0) setSelectedWorkflowId(active[0].id.toString());
        } catch (e) { console.error("Failed to load workflows"); }
    };

    const handleLaunch = async () => {
        if (!selectedWorkflowId) return;
        setLoading(true);
        try {
            await GrowthService.triggerWorkflow(parseInt(selectedWorkflowId), formData);
            toast({ title: "Campaign Launched", description: "AI is generating creatives and launching ads." });
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
                        <h1 className="text-3xl font-bold tracking-tight">Ads Automation</h1>
                        <p className="text-muted-foreground">AI-powered ad launching for Meta & Google.</p>
                    </div>

                    <div className="max-w-3xl">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-500" />
                                    Quick Launch AI
                                </CardTitle>
                                <CardDescription>Describe your offer, and AI will build the campaign.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {workflows.length === 0 ? (
                                    <div className="p-4 border border-amber-200 bg-amber-50 rounded text-amber-800 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-sm">No active 'Ads' workflows found. Register one in Embed Manager.</span>
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Platform</Label>
                                        <select
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.platform}
                                            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                        >
                                            <option value="facebook">Facebook / Instagram</option>
                                            <option value="google">Google Search</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Daily Budget ($)</Label>
                                        <Input
                                            type="number"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Landing Page URL</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Creative Prompt & Offer</Label>
                                    <Textarea
                                        className="min-h-[100px]"
                                        placeholder="Describe the product, target audience, and key offer..."
                                        value={formData.prompt}
                                        onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                                    />
                                </div>

                                <Button onClick={handleLaunch} disabled={loading || workflows.length === 0} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MousePointerClick className="h-4 w-4 mr-2" />}
                                    Generate & Launch Campaign
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
