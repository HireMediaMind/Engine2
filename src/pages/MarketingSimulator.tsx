import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  BarChart3,
  ArrowRight,
  Info,
  Sparkles,
  Bot,
  Zap
} from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';

interface SimulationResult {
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  leads: number;
  costPerLead: number;
  bookedCalls: number;
  sales: number;
  revenue: number;
  roas: number;
  isAiEnabled: boolean;
}

const industries = [
  { value: 'ecommerce', label: 'E-commerce', avgCpc: 0.8, avgConvRate: 3.5, avgOrderValue: 150, leadToSale: 0.15 },
  { value: 'saas', label: 'SaaS', avgCpc: 4.5, avgConvRate: 5.0, avgOrderValue: 2000, leadToSale: 0.2 },
  { value: 'agency', label: 'Agency/Services', avgCpc: 5.0, avgConvRate: 8.0, avgOrderValue: 5000, leadToSale: 0.25 },
  { value: 'realestate', label: 'Real Estate', avgCpc: 3.0, avgConvRate: 2.5, avgOrderValue: 15000, leadToSale: 0.05 },
  { value: 'healthcare', label: 'Healthcare/Dental', avgCpc: 4.0, avgConvRate: 10.0, avgOrderValue: 3000, leadToSale: 0.3 },
];

const MarketingSimulator = () => {
  const [budget, setBudget] = useState(2000);
  const [industry, setIndustry] = useState('agency');
  const [useAI, setUseAI] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const { addXP, markDemoCompleted } = useGamification();

  // Instant calculation on change
  const calculateResult = (newBudget: number, newIndustry: string, aiEnabled: boolean) => {
    const indData = industries.find(i => i.value === newIndustry)!;

    // Base Metrics
    const cpc = indData.avgCpc;
    const clicks = Math.floor(newBudget / cpc);
    const impressions = clicks * 100; // rough est

    // AI IMPACT:
    // With AI Lead Engine: Lead conversion rate increases (24/7 engagement)
    // With AI Lead Engine: Lead-to-Sale increases (Instant follow-up)
    const aiConvMultiplier = aiEnabled ? 1.4 : 1.0; // 40% more leads with AI optimized forms/chat
    const aiSaleMultiplier = aiEnabled ? 2.5 : 1.0; // 2.5x more sales with instant AI follow up

    const leads = Math.floor(clicks * (indData.avgConvRate / 100) * aiConvMultiplier);
    const bookedCalls = Math.floor(leads * 0.2 * aiSaleMultiplier); // 20% base booking rate
    const sales = Math.floor(bookedCalls * indData.leadToSale);

    const revenue = sales * indData.avgOrderValue;
    const roas = revenue / newBudget;

    setResult({
      impressions,
      clicks,
      ctr: 1.0,
      cpc,
      leads,
      costPerLead: leads > 0 ? newBudget / leads : 0,
      bookedCalls,
      sales,
      revenue,
      roas,
      isAiEnabled: aiEnabled
    });

    markDemoCompleted('simulator');
  };

  // Initial run
  if (!result) calculateResult(budget, industry, useAI);

  const handleBudgetChange = (val: number[]) => {
    setBudget(val[0]);
    calculateResult(val[0], industry, useAI);
  };

  const handleIndustryChange = (val: string) => {
    setIndustry(val);
    calculateResult(budget, val, useAI);
  };

  const handleAIToggle = (val: boolean) => {
    setUseAI(val);
    if (val) addXP(20);
    calculateResult(budget, industry, val);
  };

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

  const chartData = [
    { name: 'Financials', spend: budget, revenue: result?.revenue || 0 },
  ];

  return (
    <>
      <Helmet>
        <title>The Growth Simulator | HireMediaMind</title>
        <meta name="description" content="Visualize the impact of AI Automation on your marketing ROI." />
      </Helmet>

      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gradient-to-b from-background to-muted/20">
          <section className="py-12 md:py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Interactive Sales Tool
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  The <span className="gradient-text">Growth Simulator</span>
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                  See what happens when you combine Paid Ads with our AI Automation Engine.
                  <br />
                  <span className="text-sm opacity-75">(Simulated data based on industry benchmarks)</span>
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-12 max-w-6xl mx-auto">

                {/* LEFT: Inputs */}
                <Card className="lg:col-span-4 h-fit border-primary/10 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Configuration
                    </CardTitle>
                    <CardDescription>Adjust your business parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Industry */}
                    <div className="space-y-3">
                      <Label>Your Industry</Label>
                      <Select value={industry} onValueChange={handleIndustryChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map(i => (
                            <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Budget */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Monthly Ad Spend</Label>
                        <span className="font-bold text-primary">{formatCurrency(budget)}</span>
                      </div>
                      <Slider
                        value={[budget]}
                        onValueChange={handleBudgetChange}
                        min={500}
                        max={50000}
                        step={500}
                        className="py-4"
                      />
                    </div>

                    {/* AI Toggle - The "Magic" Switch */}
                    <div className={`rounded-xl border p-4 transition-all duration-300 ${useAI ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-muted/30'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Bot className={`h-5 w-5 ${useAI ? 'text-primary' : 'text-muted-foreground'}`} />
                          <Label className="font-bold text-base cursor-pointer" htmlFor="ai-toggle">
                            AI Lead Engine
                          </Label>
                        </div>
                        <Switch id="ai-toggle" checked={useAI} onCheckedChange={handleAIToggle} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {useAI
                          ? "Activated! 24/7 Instant response & nurturing enabled."
                          : "Disabled. Relying on manual follow-up (slower)."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* MIDDLE: The Visualizer */}
                <div className="lg:col-span-8 space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-card">
                      <CardContent className="p-4 pt-6">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Total Leads</div>
                        <div className="text-2xl font-bold">{result?.leads}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Est. CPL: {formatCurrency(result?.costPerLead || 0)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className={`transition-all duration-500 ${useAI ? 'bg-primary text-primary-foreground shadow-glow' : ''}`}>
                      <CardContent className="p-4 pt-6">
                        <div className={`text-xs mb-1 uppercase tracking-wider ${useAI ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          Booked Calls
                        </div>
                        <div className="text-3xl font-bold flex items-center gap-2">
                          {result?.bookedCalls}
                          {useAI && <TrendingUp className="h-5 w-5 animate-bounce" />}
                        </div>
                        <div className={`text-xs mt-1 ${useAI ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {useAI ? 'Boosted by AI Agent' : 'Manual Booking'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 pt-6">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Est. Revenue</div>
                        <div className="text-2xl font-bold text-emerald-500">{formatCurrency(result?.revenue || 0)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 pt-6">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">ROAS</div>
                        <div className="text-2xl font-bold text-blue-500">{result?.roas.toFixed(1)}x</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Chart Area */}
                  <Card className="h-[400px]">
                    <CardHeader>
                      <CardTitle>Investment vs Return</CardTitle>
                      <CardDescription>
                        {result?.profit && result.profit > 0
                          ? "Projected Positive Return"
                          : "Adjust budget to see profit potential"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(val) => `$${val}`} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Bar dataKey="spend" name="Ad Spend" fill="#64748b" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Explanation for Client */}
                  {useAI && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-4 animate-fade-in">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary">Why did the numbers jump?</h4>
                        <p className="text-sm text-muted-foreground">
                          Most leads go cold within 5 minutes. Our AI Lead Engine instantly engages every lead
                          on WhatsApp/SMS 24/7, qualifying them and booking appointments automatically.
                          This typically increases booking rates by <strong>2-3x</strong> compared to manual follow-up.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center mt-8">
                    <Button className="btn-primary text-lg px-8 py-6 h-auto shadow-xl" asChild>
                      <a href="/book-call">
                        Start Generating These Results
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </a>
                    </Button>
                  </div>

                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default MarketingSimulator;