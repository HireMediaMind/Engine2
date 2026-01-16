import { useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, MapPin, Building2, Verified } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "CEO & Founder",
    company: "TechScale Pro",
    location: "New York, USA",
    image: "SM",
    rating: 5,
    quote: "HireMediaMind transformed our lead generation completely. Their AI automation reduced our cost per lead by 62% while increasing quality leads by 3x. The ROI was visible within the first month.",
    metrics: { leads: "+340%", cost: "-62%", revenue: "$2.4M" }
  },
  {
    id: 2,
    name: "James Richardson",
    role: "Marketing Director",
    company: "CloudNine Solutions",
    location: "London, UK",
    image: "JR",
    rating: 5,
    quote: "The transparency they provide is unmatched. Real-time dashboards, weekly strategy calls, and an AI chatbot that actually books qualified meetings. They're not just an agency, they're growth partners.",
    metrics: { roas: "5.2x", meetings: "+180%", pipeline: "$4.8M" }
  },
  {
    id: 3,
    name: "Ahmed Al-Rashid",
    role: "Managing Partner",
    company: "Gulf Ventures",
    location: "Dubai, UAE",
    image: "AR",
    rating: 5,
    quote: "We've worked with agencies across the globe. HireMediaMind's combination of performance marketing expertise and AI automation is genuinely unique. They deliver results, not excuses.",
    metrics: { growth: "+290%", efficiency: "+75%", savings: "$180K" }
  },
  {
    id: 4,
    name: "Lisa Chen",
    role: "VP of Growth",
    company: "Innovate Digital",
    location: "Sydney, Australia",
    image: "LC",
    rating: 5,
    quote: "Their AI workflows handle our entire lead nurturing sequence. What used to take our team 40 hours a week now runs automatically with better results. Absolute game-changer.",
    metrics: { time: "-85%", conversions: "+220%", nps: "94" }
  },
  {
    id: 5,
    name: "Marcus Weber",
    role: "Head of Digital",
    company: "EuroTech GmbH",
    location: "Berlin, Germany",
    image: "MW",
    rating: 5,
    quote: "The level of detail in their reporting and the speed of their AI responses is impressive. Every euro we invest is tracked and optimized. True performance marketing at its best.",
    metrics: { ctr: "+145%", cpa: "-48%", revenue: "€1.8M" }
  }
];

export function GlobalTrustPanel() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section className="section-padding relative overflow-hidden bg-muted/20">
      {/* Background Effects */}
      <div className="absolute inset-0 aurora-bg opacity-20" />
      <div className="absolute inset-0 noise-texture" />
      
      <div className="relative mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="section-badge mb-4 inline-flex items-center gap-2">
            <Star className="h-4 w-4 fill-current" />
            Global Trust Panel
          </span>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-4">
            Trusted by Leaders Worldwide
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            See why 250+ businesses across 30+ countries trust us with their growth.
          </p>
        </div>

        {/* Main Testimonial Card */}
        <div className="relative max-w-4xl mx-auto">
          {/* Glow Effect */}
          <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20 blur-2xl opacity-50" />
          
          <div className="relative glass-card-premium rounded-3xl p-8 md:p-12">
            {/* Quote Icon */}
            <Quote className="absolute top-6 right-6 h-16 w-16 text-primary/10" />
            
            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-all hover:scale-110"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-all hover:scale-110"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>

            <div className="px-8 md:px-12">
              {/* Rating */}
              <div className="flex items-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-accent fill-accent" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed mb-8 font-medium">
                "{activeTestimonial.quote}"
              </blockquote>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-8 p-4 rounded-2xl bg-muted/30">
                {Object.entries(activeTestimonial.metrics).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-2xl font-bold gradient-text">{value}</p>
                    <p className="text-xs text-muted-foreground capitalize">{key}</p>
                  </div>
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold text-primary-foreground">
                  {activeTestimonial.image}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{activeTestimonial.name}</p>
                    <Verified className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{activeTestimonial.role}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {activeTestimonial.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {activeTestimonial.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 transition-all duration-300 rounded-full ${
                index === activeIndex 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Trust Logos/Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { label: "Clients", value: "250+" },
            { label: "Countries", value: "30+" },
            { label: "Revenue Generated", value: "$32M+" },
            { label: "Avg ROAS", value: "4.2x" },
            { label: "Retention Rate", value: "89%" },
          ].map((stat, index) => (
            <div 
              key={index} 
              className="text-center p-4 rounded-xl bg-card/50 border border-border/30 stagger-animation"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-2xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
