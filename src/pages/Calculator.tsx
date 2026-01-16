import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Helmet } from "react-helmet-async";

const Calculator = () => {
  const [adSpend, setAdSpend] = useState(5000);
  const [cpc, setCpc] = useState(2);
  const [conversionRate, setConversionRate] = useState(3);
  const [aov, setAov] = useState(150);
  const [aiBoost, setAiBoost] = useState(false);

  // AI boost factors
  const AI_BOOST = {
    cpc: 0.85,
    conversionRate: 1.35,
    aov: 1.1,
  };

  // Apply AI boost if enabled
  const effectiveCpc = aiBoost ? cpc * AI_BOOST.cpc : cpc;
  const effectiveConvRate = aiBoost ? conversionRate * AI_BOOST.conversionRate : conversionRate;
  const effectiveAov = aiBoost ? aov * AI_BOOST.aov : aov;

  // Calculate results
  const traffic = effectiveCpc > 0 ? adSpend / effectiveCpc : 0;
  const sales = traffic * (effectiveConvRate / 100);
  const revenue = sales * effectiveAov;
  const roas = adSpend > 0 ? revenue / adSpend : 0;

  const formatNumber = (num: number) => Math.round(num).toLocaleString();
  const formatCurrency = (num: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <>
      <Helmet>
        <title>ROAS Calculator - HireMediaMind | Calculate Your Ad Returns</title>
        <meta
          name="description"
          content="Free ROAS calculator to estimate your return on ad spend. See how AI optimization can boost your results."
        />
        <link rel="canonical" href="https://www.hiremediamind.com/calculator" />
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="gradient-hero-bg py-16">
            <div className="mx-auto max-w-4xl px-4">
              <div className="mb-12 text-center">
                <p className="section-label">Free Tool</p>
                <h1 className="section-title text-3xl md:text-4xl">ROAS Calculator</h1>
                <p className="section-subtitle mx-auto">
                  Estimate your return on ad spend and see how AI optimization can boost your results.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {/* Inputs */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-lg">
                  <h2 className="mb-6 text-lg font-semibold text-foreground">Your Numbers</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Monthly Ad Spend
                      </label>
                      <Input
                        type="number"
                        value={adSpend}
                        onChange={(e) => setAdSpend(Number(e.target.value))}
                        className="rounded-full"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Cost Per Click (CPC)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={cpc}
                        onChange={(e) => setCpc(Number(e.target.value))}
                        className="rounded-full"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Conversion Rate (%)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={conversionRate}
                        onChange={(e) => setConversionRate(Number(e.target.value))}
                        className="rounded-full"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Average Order Value
                      </label>
                      <Input
                        type="number"
                        value={aov}
                        onChange={(e) => setAov(Number(e.target.value))}
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4">
                      <div>
                        <p className="font-medium text-foreground">Enable AI Optimization</p>
                        <p className="text-xs text-muted-foreground">
                          See projected results with our AI systems
                        </p>
                      </div>
                      <Switch checked={aiBoost} onCheckedChange={setAiBoost} />
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div
                  className={`rounded-3xl border bg-card p-6 shadow-lg transition-all duration-300 ${
                    aiBoost ? "border-primary shadow-glow" : "border-border"
                  }`}
                >
                  <h2 className="mb-6 text-lg font-semibold text-foreground">
                    Projected Results {aiBoost && <span className="text-primary">(AI Boosted)</span>}
                  </h2>
                  <div className="space-y-4">
                    <div className="card-sky rounded-2xl p-4">
                      <p className="text-sm text-muted-foreground">Monthly Traffic</p>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(traffic)}</p>
                    </div>
                    <div className="card-sky rounded-2xl p-4">
                      <p className="text-sm text-muted-foreground">Projected Sales</p>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(sales)}</p>
                    </div>
                    <div className="card-emerald rounded-2xl p-4">
                      <p className="text-sm text-muted-foreground">Projected Revenue</p>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(revenue)}</p>
                    </div>
                    <div
                      className={`rounded-2xl p-4 ${
                        roas >= 3
                          ? "bg-primary/10"
                          : roas >= 2
                          ? "card-emerald"
                          : "card-sky"
                      }`}
                    >
                      <p className="text-sm text-muted-foreground">Return on Ad Spend (ROAS)</p>
                      <p className="text-3xl font-bold text-foreground">{roas.toFixed(2)}x</p>
                    </div>
                  </div>
                  {aiBoost && (
                    <div className="mt-4 rounded-xl bg-primary/10 p-3 text-center text-sm text-primary">
                      🚀 AI optimization typically improves CPC by 15%, conversion by 35%, and AOV by 10%
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 text-center">
                <a
                  href="https://wa.me/918429889303?text=Hi,%20I%20used%20your%20ROAS%20calculator%20and%20would%20like%20to%20discuss%20optimizing%20my%20ads."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex"
                >
                  Get a Free Strategy Call
                </a>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Calculator;
