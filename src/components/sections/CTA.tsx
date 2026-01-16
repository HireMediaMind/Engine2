import { ArrowRight, Sparkles, MessageSquare, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function CTA() {
  return (
    <section id="book-call" className="relative overflow-hidden border-t border-border/50">
      {/* Background Effects */}
      <div className="absolute inset-0 aurora-bg" />
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      {/* Animated Blobs */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-primary/40 via-secondary/30 to-accent/30 blur-[100px] animate-blob opacity-50" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-emerald/40 via-primary/30 to-secondary/30 blur-[120px] animate-blob opacity-40" style={{ animationDelay: "3s" }} />

      {/* Sparkle Particles */}
      <span className="pointer-events-none absolute left-[20%] top-[30%] h-3 w-3 rounded-full bg-accent shadow-lg shadow-accent/50 animate-sparkle" />
      <span className="pointer-events-none absolute right-[25%] top-[40%] h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/50 animate-sparkle" style={{ animationDelay: "0.7s" }} />
      <span className="pointer-events-none absolute left-[40%] bottom-[30%] h-2.5 w-2.5 rounded-full bg-secondary shadow-lg shadow-secondary/50 animate-sparkle" style={{ animationDelay: "1.4s" }} />

      <div className="relative mx-auto max-w-4xl px-4 py-20 md:py-28 text-center">
        {/* Badge */}
        <ScrollReveal delay={0}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full liquid-glass-premium px-5 py-2.5 animate-glow-pulse">
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-sm font-semibold tracking-wide text-foreground">
              Let's Build Together
            </span>
          </div>
        </ScrollReveal>

        {/* Headline */}
        <ScrollReveal delay={100}>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-6 leading-tight">
            Ready to Build a{" "}
            <span className="gradient-text-shimmer">Growth System</span>,{" "}
            <br className="hidden md:block" />
            Not Just Run Ads?
          </h2>
        </ScrollReveal>

        {/* Description */}
        <ScrollReveal delay={200}>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed md:text-lg">
            Let's map out your performance strategy, automations and numbers – and see if HireMediaMind is the
            right fit to help you scale.
          </p>
        </ScrollReveal>

        {/* CTA Buttons */}
        <ScrollReveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://calendly.com/team-hiremediamind/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary via-emerald to-primary bg-[length:200%_auto] px-8 py-4 text-base font-bold text-primary-foreground shadow-xl transition-all duration-500 hover:bg-[center_right] hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 btn-hover-lift press-feedback"
            >
              <Calendar className="h-5 w-5" />
              Book Free Strategy Call
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            
            <a
              href="https://wa.me/918429889303?text=Hi,%20I%27d%20like%20to%20discuss%20growth%20strategy."
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full liquid-glass-premium px-8 py-4 text-base font-semibold text-foreground transition-all duration-300 hover:shadow-xl hover:scale-105 btn-hover-lift press-feedback glow-hover"
            >
              <MessageSquare className="h-5 w-5 text-emerald" />
              Chat on WhatsApp
            </a>
          </div>
        </ScrollReveal>

        {/* Trust Indicator */}
        <ScrollReveal delay={400}>
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
              </span>
              Available 24/7
            </span>
            <span className="h-4 w-px bg-border" />
            <span>Free 30-min strategy session</span>
            <span className="h-4 w-px bg-border hidden sm:block" />
            <span className="hidden sm:block">No commitment required</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
