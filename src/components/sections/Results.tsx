import { Link } from "react-router-dom";
import { TrendingUp, Target, Zap, ArrowRight, Sparkles, Globe, MapPin } from "lucide-react";

const results = [
  {
    icon: Target,
    label: "Coaching Business",
    location: "United States",
    headline: "From inconsistent leads to 30+ qualified calls/month.",
    points: ["Meta + YouTube ads", "Lead-to-WhatsApp automations", "Pipeline tracking dashboard"],
    stat: { value: "30+", label: "Calls/Month" },
    gradient: "from-secondary/30 to-primary/20",
  },
  {
    icon: TrendingUp,
    label: "Local Clinic",
    location: "Europe",
    headline: "Reduced cost per lead by 35% within 60 days.",
    points: ["Google Search campaigns", "Landing page optimization", "Automated appointment reminders"],
    stat: { value: "35%", label: "Lower CPL" },
    gradient: "from-primary/30 to-emerald/20",
  },
  {
    icon: Zap,
    label: "Online Course Creator",
    location: "Global",
    headline: "Added 18% extra revenue from \"old leads\".",
    points: ["Reactivation campaigns", "Email & WhatsApp flows", "Upsell & down-sell automations"],
    stat: { value: "+18%", label: "Revenue Boost" },
    gradient: "from-accent/30 to-secondary/20",
  },
];

export function Results() {
  return (
    <section className="relative overflow-hidden border-t border-border/50">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-card" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      {/* Floating Effects */}
      <div className="pointer-events-none absolute right-10 top-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 blur-[60px] animate-float opacity-40" />
      <div className="pointer-events-none absolute left-20 bottom-10 h-32 w-32 rounded-full bg-gradient-to-br from-accent/30 to-emerald/20 blur-[50px] animate-float-slow opacity-30" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full liquid-glass-premium px-4 py-2">
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-foreground">Success Stories</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl mb-4">
            Results & <span className="gradient-text">Case Studies</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every business is different, but the goal is always the same: trackable, profitable growth.
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {results.map((result, index) => (
            <div
              key={result.label}
              className="group relative animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Card Glow */}
              <div className={`absolute -inset-1 rounded-[1.5rem] bg-gradient-to-br ${result.gradient} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
              
              {/* Card */}
              <div className="relative h-full rounded-[1.5rem] liquid-glass-premium p-6 border border-border/30 hover-glow-card">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    {result.location}
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${result.gradient} animate-pulse`}>
                    <result.icon className="h-5 w-5 text-foreground" />
                  </div>
                </div>

                {/* Label */}
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                  {result.label}
                </p>

                {/* Headline */}
                <p className="text-base font-semibold text-foreground mb-4 leading-snug">
                  {result.headline}
                </p>

                {/* Stat Badge */}
                <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2 mb-4">
                  <span className="text-xl font-bold gradient-text">{result.stat.value}</span>
                  <span className="text-xs text-muted-foreground">{result.stat.label}</span>
                </div>

                {/* Points */}
                <ul className="space-y-2">
                  {result.points.map((point, idx) => (
                    <li 
                      key={point} 
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/case-studies"
            className="group inline-flex items-center gap-2 rounded-full liquid-glass-premium px-6 py-3 text-sm font-semibold text-foreground transition-all hover:shadow-lg hover:scale-105"
          >
            View All Case Studies
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}