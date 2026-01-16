import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  Settings as SettingsIcon, 
  Database, 
  Key, 
  Bell,
  Shield,
  Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    apiEndpoint: "/api",
    emailNotifications: true,
    leadAlerts: true,
    paymentAlerts: true,
    weeklyReports: false,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Settings | HireMediaMind Admin</title>
      </Helmet>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          
          <main className="flex-1 p-6 lg:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Configure your admin panel and integrations
              </p>
            </div>

            <div className="grid gap-6 max-w-3xl">
              {/* API Configuration */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    API Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your Hostinger PHP API endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="apiEndpoint">API Base URL</Label>
                    <Input
                      id="apiEndpoint"
                      value={settings.apiEndpoint}
                      onChange={(e) => setSettings({ ...settings, apiEndpoint: e.target.value })}
                      placeholder="/api or https://yourdomain.com/api"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      The base path where your PHP API files are located
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure email and push notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, emailNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Lead Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when a new lead comes in
                      </p>
                    </div>
                    <Switch
                      checked={settings.leadAlerts}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, leadAlerts: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Payment Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified on successful payments
                      </p>
                    </div>
                    <Switch
                      checked={settings.paymentAlerts}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, paymentAlerts: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly summary reports
                      </p>
                    </div>
                    <Switch
                      checked={settings.weeklyReports}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, weeklyReports: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security
                  </CardTitle>
                  <CardDescription>
                    Security settings and access control
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Important:</strong> This admin panel is currently accessible without authentication. 
                      To secure it, implement PHP session-based authentication on your Hostinger server 
                      and protect the /admin routes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* PHP Files Info */}
              <Card className="border-border bg-muted/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    PHP API Setup
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload the following PHP files to your Hostinger server in the <code className="bg-muted px-1 rounded">/api</code> folder:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• <code className="bg-muted px-1 rounded">config.php</code> - Database configuration</li>
                    <li>• <code className="bg-muted px-1 rounded">leads.php</code> - Leads CRUD operations</li>
                    <li>• <code className="bg-muted px-1 rounded">pipeline.php</code> - Pipeline data</li>
                    <li>• <code className="bg-muted px-1 rounded">analytics.php</code> - Analytics data</li>
                    <li>• <code className="bg-muted px-1 rounded">dashboard-stats.php</code> - Dashboard stats</li>
                    <li>• <code className="bg-muted px-1 rounded">submit-lead.php</code> - Handle form submissions</li>
                  </ul>
                </CardContent>
              </Card>

              <Button onClick={handleSave} className="btn-primary w-fit">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
