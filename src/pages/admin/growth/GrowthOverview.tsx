
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, MousePointerClick, Send, History, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function GrowthOverview() {
    const tools = [
        {
            title: "Lead Scraper",
            description: "Extract B2B leads from LinkedIn & Maps.",
            icon: UserPlus,
            href: "/admin/growth/leads",
            color: "text-blue-500"
        },
        {
            title: "Ads Automation",
            description: "Launch AI-generated campaigns.",
            icon: MousePointerClick,
            href: "/admin/growth/ads",
            color: "text-amber-500"
        },
        {
            title: "Outreach Blaster",
            description: "Send cold emails and WhatsApp.",
            icon: Send,
            href: "/admin/growth/outreach",
            color: "text-emerald-500"
        },
        {
            title: "Execution Logs",
            description: "Monitor workflow status.",
            icon: History,
            href: "/admin/growth/logs",
            color: "text-purple-500"
        }
    ];

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <AdminSidebar />
                <main className="flex-1 p-6 lg:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Growth Lab 🚀</h1>
                        <p className="text-muted-foreground">Internal tools for automated scaling.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tools.map((tool) => (
                            <Card key={tool.title} className="hover:border-primary/50 transition-colors cursor-pointer group">
                                <Link to={tool.href}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-background border ${tool.color}`}>
                                                    <tool.icon className="h-5 w-5" />
                                                </div>
                                                {tool.title}
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </CardTitle>
                                        <CardDescription className="pt-2">
                                            {tool.description}
                                        </CardDescription>
                                    </CardHeader>
                                </Link>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-8 p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 rounded-lg">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Internal Use Only</h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                            These tools bypass standard limits and trigger costs. Use responsibly.
                            Data is processed via private n8n webhooks.
                        </p>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
