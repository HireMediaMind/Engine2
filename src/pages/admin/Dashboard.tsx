import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Users,
  DollarSign,
  Eye,
  MousePointer,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { API_ENDPOINTS } from "@/lib/api";

interface DashboardStats {
  totalLeads: number;
  totalRevenue: number;
  pageViews: number;
  conversions: number;
  bookedCalls: number;
  leadsTrend: number;
  revenueTrend: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalRevenue: 0,
    pageViews: 0,
    conversions: 0,
    bookedCalls: 0,
    leadsTrend: 0,
    revenueTrend: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.dashboardStats, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Mock data for development
      setStats({
        totalLeads: 0,
        totalRevenue: 0,
        pageViews: 0,
        conversions: 0,
        bookedCalls: 0,
        leadsTrend: 0,
        revenueTrend: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      trend: stats.leadsTrend,
      format: "number",
    },
    {
      title: "Revenue",
      value: stats.totalRevenue,
      icon: DollarSign,
      trend: stats.revenueTrend,
      format: "currency",
    },
    {
      title: "Page Views",
      value: stats.pageViews,
      icon: Eye,
      trend: 5.2,
      format: "number",
    },
    {
      title: "Conversions",
      value: stats.conversions,
      icon: MousePointer,
      trend: -2.1,
      format: "number",
    },
    {
      title: "Booked Calls",
      value: stats.bookedCalls,
      icon: Calendar,
      trend: 15.8,
      format: "number",
    },
  ];

  const formatValue = (value: number, format: string) => {
    if (format === "currency") {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | HireMediaMind Admin</title>
      </Helmet>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />

          <main className="flex-1 p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, Admin. <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded ml-2">v4.0 (HR Live)</span></p>
              </div>
              {/* Additional elements can go here if needed */}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {statCards.map((stat) => (
                <Card key={stat.title} className="border-border">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {loading ? "..." : formatValue(stat.value, stat.format)}
                    </div>
                    <div className="flex items-center text-xs mt-1">
                      {stat.trend >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={stat.trend >= 0 ? "text-emerald-500" : "text-red-500"}>
                        {Math.abs(stat.trend)}%
                      </span>
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <p className="text-muted-foreground">Loading...</p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between py-2 border-b border-border">
                          <div>
                            <p className="font-medium text-foreground">New lead from Contact Form</p>
                            <p className="text-sm text-muted-foreground">2 minutes ago</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                            New Lead
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border">
                          <div>
                            <p className="font-medium text-foreground">Call booked via Calendly</p>
                            <p className="text-sm text-muted-foreground">1 hour ago</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                            Booked
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-foreground">AI Lead Engine purchased</p>
                            <p className="text-sm text-muted-foreground">3 hours ago</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                            Payment
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <p className="text-muted-foreground">Loading...</p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between py-2 border-b border-border">
                          <div>
                            <p className="font-medium text-foreground">Strategy Call - John D.</p>
                            <p className="text-sm text-muted-foreground">Tomorrow, 10:00 AM</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                            Confirmed
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border">
                          <div>
                            <p className="font-medium text-foreground">Demo Call - Sarah M.</p>
                            <p className="text-sm text-muted-foreground">Tomorrow, 2:00 PM</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                            Confirmed
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-foreground">Follow-up - Mike R.</p>
                            <p className="text-sm text-muted-foreground">Dec 9, 11:00 AM</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                            Pending
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
