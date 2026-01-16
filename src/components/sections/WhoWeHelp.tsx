import { ScrollReveal, StaggeredReveal } from "@/components/ui/ScrollReveal";

const audiences = [
  {
    title: "Local & Service Businesses",
    description: "Clinics, salons, home services, legal, accounting, etc.",
    benefit: "More qualified leads and appointments, less manual chasing.",
    bgClass: "card-sky",
  },
  {
    title: "Coaches & Course Creators",
    description: "High-ticket programs, group coaching & online courses.",
    benefit: "Fill your calendar and programs with the right clients.",
    bgClass: "card-emerald",
  },
  {
    title: "Agencies & Consultants",
    description: "Marketing, creative, IT and specialist agencies.",
    benefit: "Scale your own lead flow or white-label our systems.",
    bgClass: "card-sky",
  },
  {
    title: "Online & Digital Brands",
    description: "Ecommerce, SaaS and info products.",
    benefit: "Improve ROAS, AOV and retention with smarter funnels.",
    bgClass: "card-emerald",
  },
];

export function WhoWeHelp() {
  return (
    <section id="services" className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <ScrollReveal className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Who We Help</h2>
            <p className="section-subtitle">
              We work with service businesses, coaches and online brands that are ready to grow with predictable systems.
            </p>
          </div>
        </ScrollReveal>
        <StaggeredReveal 
          className="grid gap-6 text-sm md:grid-cols-4"
          staggerDelay={100}
          baseDelay={100}
        >
          {audiences.map((audience, index) => (
            <div
              key={audience.title}
              className={`${audience.bgClass} rounded-2xl border border-border p-5 shadow-sm card-hover-elevate border-glow-hover`}
            >
              <h3 className="mb-2 font-semibold text-foreground">{audience.title}</h3>
              <p className="mb-2 text-xs text-muted-foreground">{audience.description}</p>
              <p className="text-xs text-muted-foreground/80">{audience.benefit}</p>
            </div>
          ))}
        </StaggeredReveal>
      </div>
    </section>
  );
}
