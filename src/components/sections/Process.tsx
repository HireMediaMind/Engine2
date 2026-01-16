import { ScrollReveal, StaggeredReveal } from "@/components/ui/ScrollReveal";

const steps = [
  {
    step: "Step 1",
    title: "Discovery & Audit",
    description: "We understand your offer, numbers and current funnel.",
  },
  {
    step: "Step 2",
    title: "Strategy Blueprint",
    description: "We design your ad strategy, funnel and automation map.",
  },
  {
    step: "Step 3",
    title: "Build & Launch",
    description: "We implement campaigns, creatives, tracking and workflows.",
  },
  {
    step: "Step 4",
    title: "Optimize & Scale",
    description: "We track performance, scale what works, and cut what doesn't.",
  },
];

export function Process() {
  return (
    <section className="border-t border-border gradient-hero-bg">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <ScrollReveal className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-title">How We Work Together</h2>
            <p className="section-subtitle">
              Simple, transparent and focused on performance – not vanity metrics.
            </p>
          </div>
        </ScrollReveal>
        <StaggeredReveal 
          className="grid gap-6 text-xs md:grid-cols-4" 
          staggerDelay={100}
          baseDelay={100}
        >
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm card-hover-elevate border-glow-hover"
            >
              <p className="section-label mb-1">{item.step}</p>
              <h3 className="mb-2 font-semibold text-foreground">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </StaggeredReveal>
      </div>
    </section>
  );
}
