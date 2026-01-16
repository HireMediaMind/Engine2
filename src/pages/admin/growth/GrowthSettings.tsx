
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GrowthService } from "@/lib/growth-service";
import { Save, Shield, Key } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function GrowthSettings() {
    const [config, setConfig] = useState({ n8n_base_url: "", n8n_secret_key: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await GrowthService.getSettings();
            setConfig({
                n8n_base_url: data.n8n_base_url || "",
                n8n_secret_key: data.n8n_secret_key || ""
            });
        } catch (e) {
            console.error("Failed to load settings");
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await GrowthService.saveSettings(config);
            toast({
                title: "Configuration Saved",
                description: "Your internal tool settings have been updated.",
            });
        } catch (e) {
            toast({
                title: "Save Failed",
                description: "Could not update settings.",
                variant: 'destructive'
            });
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
                        <h1 className="text-3xl font-bold tracking-tight">Growth Lab Settings</h1>
                        <p className="text-muted-foreground">Configure connection to your private n8n instance.</p>
                    </div>

                    <div className="max-w-2xl space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Connection Security
                                </CardTitle>
                                <CardDescription>
                                    These credentials are stored securely in your database.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>n8n Base Webhook URL</Label>
                                    <Input
                                        placeholder="https://n8n.yourdomain.com/webhook"
                                        value={config.n8n_base_url}
                                        onChange={(e) => setConfig({ ...config, n8n_base_url: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">The root URL for your webhook triggers.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Internal Secret Key (x-internal-key)</Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9"
                                            type="password"
                                            placeholder="sk_internal_..."
                                            value={config.n8n_secret_key}
                                            onChange={(e) => setConfig({ ...config, n8n_secret_key: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <Button onClick={handleSave} disabled={loading} className="w-full">
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? 'Saving...' : 'Save Configuration'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
