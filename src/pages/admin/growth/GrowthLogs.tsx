
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GrowthService, GrowthLog } from "@/lib/growth-service";
import { History, RefreshCw, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface ExtendedLog extends GrowthLog {
    workflow_name?: string;
}

export default function GrowthLogs() {
    const [logs, setLogs] = useState<ExtendedLog[]>([]);
    const [loading, setLoading] = useState(false);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await GrowthService.getLogs();
            setLogs(data);
        } catch (e) {
            toast({ title: "Error", description: "Failed to load logs.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const handleClear = async () => {
        if (confirm("Clear all execution logs?")) {
            await GrowthService.clearLogs();
            loadLogs();
        }
    };

    const getCampaignName = (payload: any) => {
        try {
            if (typeof payload === 'string') payload = JSON.parse(payload);
            return payload?.campaignName || payload?.name || 'Manual Trigger';
        } catch (e) { return 'Unknown'; }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <AdminSidebar />
                <main className="flex-1 p-6 lg:p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Workflow Logs</h1>
                            <p className="text-muted-foreground">History of n8n triggers and executions.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={loadLogs} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleClear}>
                                <Trash2 className="h-4 w-4 mr-2" /> Clear
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Execution History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {logs.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No logs found.</p>
                                ) : (
                                    logs.map((log) => (
                                        <div key={log.id} className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{log.workflow_name || 'Deleted Workflow'}</span>
                                                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                                        {log.status === 'success' ? 'Completed' : 'Failed'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Payload: {JSON.stringify(log.payload).substring(0, 100)}...
                                                </p>
                                                <p className="text-xs text-muted-foreground/60 font-mono">ID: {log.id}</p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(log.executed_at), 'MMM d, HH:mm:ss')}
                                                </div>
                                                {log.status === 'success' ? (
                                                    <div className="flex items-center justify-end gap-1 text-xs text-emerald-500">
                                                        <CheckCircle className="h-3 w-3" /> Success
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1 text-xs text-red-500">
                                                        <XCircle className="h-3 w-3" /> Error
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </SidebarProvider>
    );
}
