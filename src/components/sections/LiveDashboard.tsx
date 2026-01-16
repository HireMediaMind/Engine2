import { useState, useEffect } from "react";
import { Activity, TrendingUp, Users, DollarSign, BarChart3, Globe, Clock, ArrowUpRight, Zap } from "lucide-react";

const generateRandomMetric = (base: number, variance: number) => {
  return base + Math.floor(Math.random() * variance * 2) - variance;
};

const metrics = [
  { 
    id: "visitors", 
    label: "Active Visitors", 
    icon: Users, 
    color: "primary",
    base: 1247,
    variance: 50,
    suffix: "",
    change: "+12%"
  },
  { 
    id: "conversions", 
    label: "Today's Conversions", 
    icon: TrendingUp, 
    color: "emerald",
    base: 89,
    variance: 5,
    suffix: "",
    change: "+8%"
  },
  { 
    id: "revenue", 
    label: "Revenue Today", 
    icon: DollarSign, 
    color: "accent",
    base: 12450,
    variance: 500,
    suffix: "",
    prefix: "$",
    change: "+15%"
  },
  { 
    id: "roas", 
    label: "Current ROAS", 
    icon: BarChart3, 
    color: "secondary",
    base: 4.2,
    variance: 0.3,
    suffix: "x",
    change: "+0.3x"
  },
];

const recentEvents = [
  { type: "conversion", location: "New York, US", value: "$245", time: "Just now" },
  { type: "lead", location: "London, UK", value: "Enterprise", time: "2m ago" },
  { type: "conversion", location: "Dubai, UAE", value: "$890", time: "5m ago" },
  { type: "booking", location: "Sydney, AU", value: "Strategy Call", time: "8m ago" },
  { type: "conversion", location: "Berlin, DE", value: "$1,240", time: "12m ago" },
];

export function LiveDashboard() {
  const [liveMetrics, setLiveMetrics] = useState(metrics.map(m => ({ ...m, value: m.base })));
  const [pulsingMetric, setPulsingMetric] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * metrics.length);
      const metric = metrics[randomIndex];
      
      setPulsingMetric(metric.id);
      setTimeout(() => setPulsingMetric(null), 500);

      setLiveMetrics(prev => prev.map((m, idx) => {
        if (idx === randomIndex) {
          const newValue = typeof m.base === 'number' 
            ? generateRandomMetric(m.base, m.variance) 
            : m.base;
          return { ...m, value: newValue };
        }
        return m;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="absolute inset-0 grid-pattern opacity-15" />
      
      {/* Animated Background Orbs */}
      <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary/10 blur-[100px] animate-blob" />
      <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-secondary/10 blur-[120px] animate-blob" style={{ animationDelay: "2s" }} />
      
      <div className="relative mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="section-badge mb-4 inline-flex items-center gap-2">
            <Activity className="h-4 w-4 animate-pulse" />
            Live Intelligence View
          </span>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-4">
            Real-Time Growth Feed
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Transparency matters. See live, anonymized performance data from active client campaigns.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Metrics Panel */}
          <div className="lg:col-span-2 glass-card-premium rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">KPI Flow Window</h3>
                  <p className="text-sm text-muted-foreground">Aggregated real-time data</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald/10 text-emerald text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
                </span>
                Live Data
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-6">
              {liveMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className={`p-6 rounded-2xl bg-gradient-to-br from-${metric.color}/5 to-${metric.color}/10 border border-${metric.color}/10 transition-all duration-300 ${
                    pulsingMetric === metric.id ? 'scale-[1.02] shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-10 w-10 rounded-xl bg-${metric.color}/10 flex items-center justify-center`}>
                      <metric.icon className={`h-5 w-5 text-${metric.color}`} />
                    </div>
                    <span className={`text-xs font-medium text-${metric.color} flex items-center gap-1`}>
                      {metric.change}
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1 tabular-nums">
                    {metric.prefix || ""}{typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}{metric.suffix}
                  </p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>

            {/* Chart Placeholder */}
            <div className="mt-8 p-6 rounded-2xl bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-foreground">Hourly Performance</span>
                <span className="text-xs text-muted-foreground">Last 24 hours</span>
              </div>
              <div className="flex items-end gap-1 h-24">
                {Array.from({ length: 24 }).map((_, i) => {
                  const height = 20 + Math.random() * 80;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary/60 to-primary/20 rounded-t transition-all duration-500 hover:from-primary hover:to-primary/40"
                      style={{ 
                        height: `${height}%`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Events Feed */}
          <div className="glass-card-premium rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-secondary animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Live Events</h3>
                <p className="text-xs text-muted-foreground">Worldwide activity</p>
              </div>
            </div>

            <div className="space-y-3">
              {recentEvents.map((event, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-muted/30 border border-border/30 transition-all duration-300 hover:bg-muted/50 stagger-animation"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      event.type === 'conversion' ? 'bg-emerald/10 text-emerald' :
                      event.type === 'lead' ? 'bg-secondary/10 text-secondary' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {event.type}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{event.location}</span>
                    <span className="text-sm font-medium text-primary">{event.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badge */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 text-center">
              <Zap className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Data anonymized & aggregated from 250+ active campaigns
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
