import { Link } from "react-router-dom";
import { TrendingUp, Bot, Sparkles, ArrowRight, Zap, Target, BarChart3, MessageSquare } from "lucide-react";
import { ScrollReveal, StaggeredReveal } from "@/components/ui/ScrollReveal";

const services = [
  {
    icon: TrendingUp,
    title: "Performance Marketing",
    description: "Done-for-you campaigns that turn ad spend into measurable profit.",
    features: [
      { icon: Target, text: "Meta Ads (Facebook & Instagram)" },
      { icon: Zap, text: "Google Search & YouTube Ads" },
      { icon: BarChart3, text: "Landing pages & funnels that convert" },
      { icon: Sparkles, text: "Creative testing & performance dashboards" },
    ],
    gradient: "from-secondary/20 via-primary/10 to-accent/20",
    iconGradient: "from-secondary to-primary",
    link: "/services/performance-marketing",
  },
  {
    icon: Bot,
    title: "AI Automations",
    description: "Automate lead capture, follow-up and booking so no opportunity is left behind.",
    features: [
      { icon: MessageSquare, text: "WhatsApp & email follow-up sequences" },
      { icon: Target, text: "Lead qualification & routing flows" },
      { icon: BarChart3, text: "CRM integration and lead tracking" },
      { icon: Zap, text: "Appointment and payment automations" },
    ],
    gradient: "from-primary/20 via-emerald/10 to-secondary/20",
    iconGradient: "from-primary to-emerald",
    link: "/services/ai-automation",
  },
];

export function Services() {
  return (
    <section className="relative overflow-hidden border-t border-border/50">
      {/* Background Effects */}
      <div className="absolute inset-0 aurora-bg opacity-30" />
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      
      {/* Floating Orbs */}
      <div className="pointer-events-none absolute -right-20 top-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-[80px] animate-float opacity-40" />
      <div className="pointer-events-none absolute -left-20 bottom-20 h-48 w-48 rounded-full bg-gradient-to-br from-accent/20 to-emerald/20 blur-[60px] animate-float-slow opacity-30" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
        {/* Section Header */}
        <ScrollReveal className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full liquid-glass-premium px-4 py-2">
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-foreground">Our Services</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl mb-4">
            What We <span className="gradient-text">Do Best</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We blend performance marketing with AI-powered automations to build complete growth systems.
          </p>
        </ScrollReveal>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {services.map((service, index) => (
            <ScrollReveal
              key={service.title}
              delay={index * 150}
              className="group relative"
            >
              {/* Card Glow */}
              <div className={`absolute -inset-1 rounded-[2rem] bg-gradient-to-r ${service.gradient} blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
              
              {/* Card */}
              <div className="relative rounded-[2rem] liquid-glass-premium p-8 border border-border/30 card-hover-elevate border-glow-hover h-full">
                {/* Icon */}
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${service.iconGradient} shadow-lg animate-glow-pulse`}>
                  <service.icon className="h-7 w-7 text-primary-foreground" />
                </div>

                {/* Title & Description */}
                <h3 className="mb-3 text-xl font-bold text-foreground">{service.title}</h3>
                <p className="mb-6 text-sm text-muted-foreground leading-relaxed">{service.description}</p>

                {/* Features */}
                <ul className="mb-8 space-y-3">
                  {service.features.map((feature, idx) => (
                    <li 
                      key={feature.text} 
                      className="flex items-center gap-3 text-sm text-foreground/80"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-card to-muted/50 border border-border/50 shadow-sm transition-all duration-300 group-hover:border-primary/30">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </span>
                      {feature.text}
                    </li>
                  ))}
                </ul>

                {/* CTA Link */}
                <Link
                  to={service.link}
                  className="group/link inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3 link-underline"
                >
                  View Pricing & Plans
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
