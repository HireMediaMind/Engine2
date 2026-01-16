import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, Zap, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Growth Starter",
    icon: Sparkles,
    description: "Perfect for startups ready to scale with AI-powered marketing",
    price: "2,500",
    period: "/month",
    highlight: false,
    features: [
      "Facebook & Google Ads Management",
      "AI Chatbot Setup (1 Platform)",
      "Weekly Performance Reports",
      "Email Automation (Basic)",
      "Monthly Strategy Call",
      "Up to $10K Ad Spend Management"
    ],
    cta: "Start Growing",
    color: "primary"
  },
  {
    name: "Scale Pro",
    icon: Rocket,
    description: "For ambitious businesses ready to dominate their market",
    price: "5,000",
    period: "/month",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Everything in Growth Starter",
      "AI Chatbot (Multi-Platform)",
      "Full Workflow Automation",
      "Real-Time Dashboard Access",
      "Bi-Weekly Strategy Calls",
      "Up to $50K Ad Spend Management",
      "A/B Testing & Optimization",
      "Priority Support"
    ],
    cta: "Scale Now",
    color: "secondary"
  },
  {
    name: "Enterprise",
    icon: Crown,
    description: "Custom solutions for large-scale operations",
    price: "Custom",
    period: "",
    highlight: false,
    features: [
      "Everything in Scale Pro",
      "Unlimited AI Automations",
      "Dedicated Account Manager",
      "Custom Integrations",
      "White-Label Options",
      "Unlimited Ad Spend Management",
      "SLA Guarantees",
      "On-Demand Strategy Sessions"
    ],
    cta: "Contact Sales",
    color: "accent"
  }
];

export function ValuePaths() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      <div className="relative mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="section-badge mb-4 inline-flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Value Paths & Offerings
          </span>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-4">
            Invest in Predictable Growth
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Transparent pricing. No hidden fees. Choose the path that matches your ambition.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-500 stagger-animation ${
                plan.highlight 
                  ? 'glass-card-premium scale-105 border-2 border-primary/30' 
                  : 'glass-card-premium hover:scale-[1.02]'
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-xs font-semibold text-primary-foreground">
                  {plan.badge}
                </div>
              )}

              {/* Plan Icon */}
              <div className={`mb-6 h-14 w-14 rounded-2xl bg-${plan.color}/10 flex items-center justify-center`}>
                <plan.icon className={`h-7 w-7 text-${plan.color}`} />
              </div>

              {/* Plan Info */}
              <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price === "Custom" ? "" : "$"}{plan.price}
                </span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3 text-sm">
                    <div className={`mt-0.5 h-5 w-5 rounded-full bg-${plan.color}/10 flex items-center justify-center flex-shrink-0`}>
                      <Check className={`h-3 w-3 text-${plan.color}`} />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link 
                to={plan.price === "Custom" ? "/contact" : "/book-call"}
                className="w-full"
              >
                <Button 
                  className={`w-full h-12 rounded-xl font-semibold group ${
                    plan.highlight 
                      ? 'btn-primary' 
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">
            🛡️ 30-Day Performance Guarantee
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            If you don't see measurable improvement in your key metrics within the first 30 days, 
            we'll work for free until you do. That's our commitment to your success.
          </p>
        </div>
      </div>
    </section>
  );
}
