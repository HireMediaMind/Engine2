import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { 
  Eye, 
  MousePointer, 
  FileText, 
  Calendar,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface AnalyticsData {
  pageViews: number;
  buttonClicks: number;
  formSubmissions: number;
  calendarBookings: number;
  productPurchases: number;
  conversionRate: number;
}

const trafficData = [
  { date: "Dec 1", views: 120, leads: 8 },
  { date: "Dec 2", views: 150, leads: 12 },
  { date: "Dec 3", views: 180, leads: 15 },
  { date: "Dec 4", views: 140, leads: 10 },
  { date: "Dec 5", views: 200, leads: 18 },
  { date: "Dec 6", views: 220, leads: 22 },
  { date: "Dec 7", views: 190, leads: 16 },
];

const pageData = [
  { page: "Home", views: 1250 },
  { page: "Services", views: 890 },
  { page: "AI Automation", views: 720 },
  { page: "Performance Marketing", views: 650 },
  { page: "Book Call", views: 480 },
  { page: "AI Lead Engine", views: 320 },
];

const conversionData = [
  { source: "Contact Form", conversions: 45 },
  { source: "Book Call", conversions: 32 },
  { source: "Lead Magnet", conversions: 28 },
  { source: "AI Lead Engine", conversions: 15 },
];

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    pageViews: 0,
    buttonClicks: 0,
    formSubmissions: 0,
    calendarBookings: 0,
    productPurchases: 0,
    conversionRate: 0,
  });
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Replace with your Hostinger PHP API endpoint
      const response = await fetch(`/api/analytics.php?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Mock data for development
      setAnalytics({
        pageViews: 3842,
        buttonClicks: 892,
        formSubmissions: 67,
        calendarBookings: 23,
        productPurchases: 8,
        conversionRate: 4.2,
      });
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    { title: "Page Views", value: analytics.pageViews, icon: Eye, trend: 12.5 },
    { title: "Button Clicks", value: analytics.buttonClicks, icon: MousePointer, trend: 8.3 },
    { title: "Form Submissions", value: analytics.formSubmissions, icon: FileText, trend: 15.2 },
    { title: "Calendar Bookings", value: analytics.calendarBookings, icon: Calendar, trend: 22.1 },
    { title: "Product Purchases", value: analytics.productPurchases, icon: ShoppingCart, trend: -5.4 },
    { title: "Conversion Rate", value: `${analytics.conversionRate}%`, icon: TrendingUp, trend: 3.8 },
  ];

  return (
    <>
      <Helmet>
        <title>Analytics | HireMediaMind Admin</title>
      </Helmet>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          
          <main className="flex-1 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                  Track your website and conversion metrics
                </p>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {metricCards.map((metric) => (
                <Card key={metric.title} className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex items-center text-xs">
                        {metric.trend >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-500" />
                        )}
                        <span className={metric.trend >= 0 ? "text-emerald-500" : "text-red-500"}>
                          {Math.abs(metric.trend)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? "..." : typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{metric.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Traffic & Leads Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trafficData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }} 
                        />
                        <Area
                          type="monotone"
                          dataKey="views"
                          stackId="1"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary) / 0.2)"
                          name="Page Views"
                        />
                        <Area
                          type="monotone"
                          dataKey="leads"
                          stackId="2"
                          stroke="hsl(142 76% 36%)"
                          fill="hsl(142 76% 36% / 0.2)"
                          name="Leads"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Top Pages by Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pageData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis dataKey="page" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }} 
                        />
                        <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conversion Sources */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Conversion Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {conversionData.map((source) => (
                    <div
                      key={source.source}
                      className="p-4 rounded-xl bg-muted/30 border border-border"
                    >
                      <p className="text-sm text-muted-foreground">{source.source}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {source.conversions}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">conversions</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
