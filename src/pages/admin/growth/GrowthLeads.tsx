
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GrowthService, Workflow } from "@/lib/growth-service";
import { UserPlus, Search, Play, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function GrowthLeads() {
    const [loading, setLoading] = useState(false);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");

    // Form Data
    const [formData, setFormData] = useState({
        country: "",
        industry: "",
        jobTitle: "",
        limit: "50",
        campaignName: ""
    });

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            const data = await GrowthService.getWorkflows('Leads');
            const active = data.filter((w: Workflow) => w.is_active);
            setWorkflows(active);
            if (active.length > 0) {
                setSelectedWorkflowId(active[0].id.toString());
            }
        } catch (e) {
            console.error("Failed to load workflows");
        }
    };

    const handleStart = async () => {
        if (!selectedWorkflowId) {
            toast({ title: "No Workflow", description: "Select a workflow backend first.", variant: "destructive" });
            return;
        }
        if (!formData.campaignName || !formData.jobTitle) {
            toast({ title: "Missing Fields", description: "Campaign Name and Job Title are required.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await GrowthService.triggerWorkflow(parseInt(selectedWorkflowId), formData);
            toast({ title: "Workflow Started", description: `Scraing leads for ${formData.campaignName}` });
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to trigger workflow.", variant: "destructive" });
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
                        <h1 className="text-3xl font-bold tracking-tight">Lead Generation</h1>
                        <p className="text-muted-foreground">Tools to scrape and enrich B2B leads.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5 text-primary" />
                                    LinkedIn Lead Scraper
                                </CardTitle>
                                <CardDescription>Target professionals by job title and industry.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {workflows.length === 0 ? (
                                    <div className="p-4 border border-amber-200 bg-amber-50 rounded text-amber-800 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-sm">No active 'Leads' workflows found. Register one in Embed Manager.</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>Select Backend Workflow</Label>
                                        <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select workflow..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {workflows.map(w => (
                                                    <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Campaign Name</Label>
                                    <Input
                                        placeholder="e.g. CEO Outreach Q1"
                                        value={formData.campaignName}
                                        onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Job Title</Label>
                                        <Input
                                            placeholder="e.g. Founder"
                                            value={formData.jobTitle}
                                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Industry</Label>
                                        <Input
                                            placeholder="e.g. SaaS"
                                            value={formData.industry}
                                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Country</Label>
                                        <Select onValueChange={(v) => setFormData({ ...formData, country: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="us">United States</SelectItem>
                                                <SelectItem value="uk">United Kingdom</SelectItem>
                                                <SelectItem value="ca">Canada</SelectItem>
                                                <SelectItem value="de">Germany</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Limit</Label>
                                        <Input
                                            type="number"
                                            value={formData.limit}
                                            onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <Button onClick={handleStart} disabled={loading || workflows.length === 0} className="w-full">
                                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                                    Start Scraper
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="opacity-60 pointer-events-none grayscale">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Google Maps Scraper
                                </CardTitle>
                                <CardDescription>Find local businesses (Coming Soon).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground">Module under construction</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
