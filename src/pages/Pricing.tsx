import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Check, Globe } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const currencies = {
  USD: { symbol: "$", label: "USD (United States)" },
  INR: { symbol: "₹", label: "INR (India)" },
  GBP: { symbol: "£", label: "GBP (United Kingdom)" },
  AED: { symbol: "AED ", label: "AED (UAE)" },
  EUR: { symbol: "€", label: "EUR (Europe)" },
  SGD: { symbol: "S$", label: "SGD (Singapore)" },
  AUD: { symbol: "A$", label: "AUD (Australia)" },
  CAD: { symbol: "C$", label: "CAD (Canada)" },
};

type CurrencyCode = keyof typeof currencies;

const pricingData: Record<CurrencyCode, { starter: number; growth: number; premium: number }> = {
  USD: { starter: 500, growth: 1200, premium: 3000 },
  INR: { starter: 40000, growth: 100000, premium: 250000 },
  GBP: { starter: 400, growth: 1000, premium: 2500 },
  AED: { starter: 1800, growth: 4500, premium: 11000 },
  EUR: { starter: 450, growth: 1100, premium: 2800 },
  SGD: { starter: 700, growth: 1600, premium: 4000 },
  AUD: { starter: 800, growth: 1800, premium: 4500 },
  CAD: { starter: 700, growth: 1600, premium: 4000 },
};

const Pricing = () => {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  const plans = [
    {
      name: "Starter",
      price: pricingData[currency].starter,
      period: "/month",
      description: "Perfect for businesses just getting started with paid ads.",
      features: [
        "1 Ad Platform (Meta OR Google)",
        "Up to $3,000 ad spend management",
        "Basic landing page",
        "Weekly performance reports",
        "Email support",
      ],
      cta: "Buy Now",
      popular: false,
    },
    {
      name: "Growth",
      price: pricingData[currency].growth,
      period: "/month",
      description: "For businesses ready to scale with multi-channel campaigns.",
      features: [
        "2 Ad Platforms (Meta + Google)",
        "Up to $10,000 ad spend management",
        "Custom landing pages",
        "AI chatbot setup",
        "WhatsApp automation",
        "Bi-weekly strategy calls",
        "Priority support",
      ],
      cta: "Buy Now",
      popular: true,
    },
    {
      name: "Premium",
      price: pricingData[currency].premium,
      period: "/month",
      description: "Full-service growth system for established brands.",
      features: [
        "All ad platforms",
        "Unlimited ad spend management",
        "Complete funnel build",
        "Advanced AI automations",
        "CRM integration",
        "Weekly strategy calls",
        "Dedicated account manager",
        "Custom reporting dashboard",
      ],
      cta: "Contact Us",
      popular: false,
    },
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Helmet>
        <title>Pricing - HireMediaMind | Performance Marketing & AI Automation</title>
        <meta
          name="description"
          content={`Transparent pricing for performance marketing and AI automation services. Plans starting from ${formatPrice(pricingData[currency].starter)}.`}
        />
        <link rel="canonical" href="https://www.hiremediamind.com/pricing" />
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="gradient-hero-bg py-16">
            <div className="mx-auto max-w-6xl px-4">
              <div className="mb-8 text-center">
                <p className="section-label">Pricing Plans</p>
                <h1 className="section-title text-3xl md:text-4xl">
                  Simple, Transparent Pricing
                </h1>
                <p className="section-subtitle mx-auto">
                  Choose the plan that fits your business stage. All plans include strategy, setup, and ongoing optimization.
                </p>
              </div>

              {/* Currency Switcher */}
              <div className="mb-12 flex justify-center">
                <div className="flex items-center gap-3 bg-card border border-border rounded-full px-4 py-2 shadow-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Currency:</span>
                  <Select value={currency} onValueChange={(val) => setCurrency(val as CurrencyCode)}>
                    <SelectTrigger className="h-8 border-none bg-transparent focus:ring-0 w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currencies).map(([code, info]) => (
                        <SelectItem key={code} value={code}>
                          {info.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative rounded-3xl border bg-card p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${plan.popular ? "border-primary shadow-glow" : "border-border"
                      }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                        Most Popular
                      </span>
                    )}
                    <div className="mb-6">
                      <h3 className="mb-2 text-xl font-bold text-foreground">{plan.name}</h3>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-foreground">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="ml-1 text-muted-foreground">{plan.period}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={`https://wa.me/918429889303?text=Hi,%20I%27m%20interested%20in%20the%20${encodeURIComponent(plan.name)}%20plan%20(${currency}).`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full rounded-full py-3 text-center font-semibold transition-all ${plan.popular
                          ? "btn-primary"
                          : "border border-primary/20 bg-card text-primary hover:border-primary/40"
                        }`}
                    >
                      {plan.cta}
                    </a>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Ad spend is paid directly to platforms (Meta, Google). These prices are for management services only.
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Pricing;
