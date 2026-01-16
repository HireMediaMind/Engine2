import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface HRStats {
    activePartners: number;
    activeEmployees: number;
    docsGenerated: number;
    revokedCount: number;
}

interface Activity {
    entity_name: string;
    type: string;
    generated_date: string;
}

export default function HRDashboard() {
    const [stats, setStats] = useState<HRStats>({
        activePartners: 0,
        activeEmployees: 0,
        docsGenerated: 0,
        revokedCount: 0
    });
    const [activity, setActivity] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch('/api/admin/hr/stats.php', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.stats) {
                setStats(data.stats);
                setActivity(data.recentActivity);
            }
        } catch (error) {
            console.error("Failed to fetch HR stats", error);
        } finally {
            setIsLoading(false);
        }
    };

    const widgets = [
        {
            title: "Total Partners",
            value: stats.activePartners,
            icon: Users,
            color: "text-blue-500",
            description: "Active Registered Partners"
        },
        {
            title: "Active Employees",
            value: stats.activeEmployees,
            icon: Briefcase,
            color: "text-green-500",
            description: "Full-time & Contractors"
        },
        {
            title: "Documents Generated",
            value: stats.docsGenerated,
            icon: FileText,
            color: "text-purple-500",
            description: "Contracts & Letters"
        },
        {
            title: "Revoked / Terminated",
            value: stats.revokedCount,
            icon: AlertTriangle,
            color: "text-red-500",
            description: "Inactive Records"
        }
    ];

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">HR & Legal Overview</h1>
                <p className="text-muted-foreground">Manage your partners, employees, and legal compliance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {widgets.map((widget, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {widget.title}
                            </CardTitle>
                            <widget.icon className={`h-4 w-4 ${widget.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isLoading ? "..." : widget.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {widget.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Legal Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {activity.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No recent documents generated.</p>
                            ) : (
                                activity.map((item, i) => (
                                    <div className="flex items-center" key={i}>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {item.type} Agreement Generated
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                For {item.entity_name}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-sm text-muted-foreground">
                                            {new Date(item.generated_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
