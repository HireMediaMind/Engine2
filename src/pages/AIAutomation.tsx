import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Check, Bot, MessageSquare, Calendar, CreditCard, ArrowRight, Workflow, Users, Settings, Zap, Play, Shield, Eye, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const modules = [
  {
    icon: MessageSquare,
    title: "Lead Capture Automation",
    description: "Capture every lead and never miss an opportunity",
    features: [
      "Smart forms → CRM sync",
      "WhatsApp instant response",
      "Lead qualification flows",
      "Auto-assignment to team",
    ],
    color: "bg-sky/20 text-sky",
  },
  {
    icon: Workflow,
    title: "Nurture Automation",
    description: "Automated follow-ups that feel personal",
    features: [
      "7-day email sequences",
      "WhatsApp follow-ups",
      "Behavior-triggered messages",
      "Re-engagement campaigns",
    ],
    color: "bg-teal/20 text-teal",
  },
  {
    icon: Calendar,
    title: "Appointment Automation",
    description: "Fill your calendar on autopilot",
    features: [
      "Calendar booking links",
      "Auto-reminders (Email + WA)",
      "No-show follow-ups",
      "Rescheduling workflows",
    ],
    color: "bg-primary/20 text-primary",
  },
];

// Layer 1: Individual Automations
const individualAutomations = [
  {
    icon: Bot,
    name: "Website AI Chatbot",
    description: "24/7 intelligent chat support for your website",
    price: "From $249",
    hasDemo: true,
  },
  {
    icon: MessageSquare,
    name: "WhatsApp AI Chatbot",
    description: "Automated responses via WhatsApp Business",
    price: "From $299",
    hasDemo: true,
  },
  {
    icon: Users,
    name: "Lead Capture → CRM",
    description: "Automatically sync leads to your CRM",
    price: "From $199",
    hasDemo: false,
  },
  {
    icon: Workflow,
    name: "Email Follow-Up Automation",
    description: "Automated email sequences that convert",
    price: "From $249",
    hasDemo: false,
  },
  {
    icon: Calendar,
    name: "Appointment Booking",
    description: "Self-service booking with reminders",
    price: "From $199",
    hasDemo: false,
  },
  {
    icon: CreditCard,
    name: "Lead Scoring Automation",
    description: "AI-powered lead prioritization",
    price: "From $349",
    hasDemo: false,
  },
];

// Layer 2: Automation Systems (Bundles)
const automationSystems = [
  {
    name: "Starter Automation",
    price: "$697",
    period: "one-time",
    tagline: "Essential automations",
    description: "Pick any 3 automations that fit your business needs.",
    features: [
      "Choose any 3 automations",
      "Professional setup & connection",
      "Full system integration",
      "Documentation & training",
      "30-day support",
    ],
    cta: "Get Started",
    ctaLink: "/book-call",
    popular: false,
  },
  {
    name: "Pro Lead Engine",
    price: "$1,497",
    period: "one-time",
    tagline: "Complete lead system",
    description: "Complete lead capture, qualification, nurture, and booking system.",
    features: [
      "Everything in Starter",
      "Lead qualification chatbot",
      "Multi-step nurture sequences",
      "CRM integration (HubSpot/GoHighLevel)",
      "Pipeline automation",
      "Appointment reminders",
      "A/B testing setup",
      "60-day support",
    ],
    cta: "Get Started",
    ctaLink: "/book-call",
    popular: true,
  },
  {
    name: "Scale AI System",
    price: "$3,497",
    period: "one-time",
    tagline: "Enterprise automation",
    description: "Enterprise-grade AI automation ecosystem for high-volume businesses.",
    features: [
      "Everything in Pro",
      "Custom AI chatbot (Web + WhatsApp)",
      "Advanced lead scoring",
      "Payment automation",
      "Custom workflows",
      "Team routing & assignments",
      "Multi-channel sequences",
      "Custom integrations",
      "90-day support + training",
    ],
    cta: "Book Strategy Call",
    ctaLink: "/book-call",
    popular: false,
  },
];

const pricingFaqs = [
  {
    question: "Can I buy only one automation?",
    answer: "Yes! You can purchase individual automations starting from $199. Perfect for testing or if you only need a specific solution.",
  },
  {
    question: "Can I upgrade later?",
    answer: "Absolutely! You can upgrade anytime and only pay the difference. Your investment is never wasted.",
  },
  {
    question: "Do I need all automations?",
    answer: "No. Start with what you need. Our modular approach means you only pay for what serves your business.",
  },
  {
    question: "What if I need something custom?",
    answer: "We design fully custom AI automation systems. Book a strategy call and we'll create a tailored solution for your unique requirements.",
  },
];

const generalFaqs = [
  {
    question: "What platforms do you integrate with?",
    answer: "We work with most popular tools including HubSpot, GoHighLevel, Zapier, Make.com, n8n, Calendly, Stripe, Razorpay, WhatsApp Business API, and many more. If you use a specific tool, ask us during the strategy call.",
  },
  {
    question: "How long does setup take?",
    answer: "Starter Automation takes 3-5 business days. Pro Lead Engine takes 7-10 business days. Scale AI System takes 2-3 weeks depending on complexity. We provide a detailed timeline during onboarding.",
  },
  {
    question: "Do I need technical knowledge?",
    answer: "Not at all! We handle all the technical setup. You'll receive training on how to use the system, and we provide documentation and video walkthroughs for your team.",
  },
  {
    question: "What if I need changes after setup?",
    answer: "Minor tweaks during the support period are included. For major changes or new features, we offer monthly retainer plans starting at $297/month or project-based pricing.",
  },
];

const AIAutomation = () => {
  return (
    <>
      <Helmet>
        <title>AI Automation Services - HireMediaMind | WhatsApp Bots, CRM & Workflows</title>
        <meta
          name="description"
          content="Automate your follow-ups, booking & revenue with AI. WhatsApp chatbots, CRM automation, and n8n workflows. One-time setup from $697."
        />
        <meta
          name="keywords"
          content="AI automation agency, WhatsApp chatbot, CRM automation, workflow automation, n8n, lead automation, business automation"
        />
        <link rel="canonical" href="https://www.hiremediamind.com/services/ai-automation" />
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="gradient-hero-bg relative overflow-hidden py-20">
            <div className="absolute inset-0 bg-gradient-to-br from-teal/5 via-transparent to-primary/5" />
            <div className="mx-auto max-w-6xl px-4 relative">
              <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-4 py-1.5 text-sm font-medium text-teal mb-6">
                  <Bot className="h-4 w-4" />
                  AI Automation
                </span>
                <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl mb-6">
                  Automate your follow-ups, booking & revenue —{" "}
                  <span className="text-gradient">even while you sleep</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  We build intelligent automation systems that capture leads, nurture prospects, 
                  and book appointments on autopilot. Built with n8n, Make.com, and WhatsApp Business API.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/book-call" className="btn-primary inline-flex items-center gap-2">
                    Book Free Strategy Call
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/products/ai-lead-engine" className="btn-secondary inline-flex items-center gap-2">
                    View AI Lead Engine
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Modules Section */}
          <section className="border-t border-border bg-background py-16">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <h2 className="section-title">Three Powerful Automation Modules</h2>
                <p className="section-subtitle mx-auto">
                  Each module works independently or together as a complete system
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {modules.map((module) => (
                  <div
                    key={module.title}
                    className="rounded-3xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/30"
                  >
                    <div className={`h-12 w-12 rounded-2xl ${module.color} flex items-center justify-center mb-4`}>
                      <module.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{module.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                    <ul className="space-y-2">
                      {module.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="border-t border-border gradient-hero-bg py-16">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <h2 className="section-title">How Our Automations Work</h2>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: "1", title: "Lead Comes In", desc: "Form, ad, or referral" },
                  { step: "2", title: "Instant Response", desc: "WhatsApp + email within seconds" },
                  { step: "3", title: "Qualify & Nurture", desc: "AI qualifies and follows up" },
                  { step: "4", title: "Book & Close", desc: "Calendar booked, payment collected" },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tools We Use */}
          <section className="border-t border-border bg-background py-12">
            <div className="mx-auto max-w-6xl px-4">
              <p className="text-center text-sm font-medium text-muted-foreground mb-8">
                BUILT WITH INDUSTRY-LEADING TOOLS
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
                {["n8n", "Make.com", "Zapier", "WhatsApp Business", "HubSpot", "GoHighLevel", "Calendly", "Stripe"].map((tool) => (
                  <span key={tool} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works - Simple Version */}
          <section className="border-t border-border gradient-hero-bg py-16">
            <div className="mx-auto max-w-5xl px-4">
              <div className="text-center mb-12">
                <h2 className="section-title">How It Works</h2>
                <p className="section-subtitle mx-auto">
                  Simple, transparent, and professional
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 transition-all group-hover:bg-primary/20 group-hover:scale-105">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">Step 1: Choose Your Automation</h3>
                  <p className="text-sm text-muted-foreground">
                    Pick an individual automation or a complete system that fits your needs.
                  </p>
                </div>
                <div className="text-center group">
                  <div className="h-16 w-16 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-4 transition-all group-hover:bg-teal/20 group-hover:scale-105">
                    <Settings className="h-8 w-8 text-teal" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">Step 2: Setup & Secure Connection</h3>
                  <p className="text-sm text-muted-foreground">
                    We professionally configure workflows and securely connect your tools.
                  </p>
                </div>
                <div className="text-center group">
                  <div className="h-16 w-16 rounded-2xl bg-sky/10 flex items-center justify-center mx-auto mb-4 transition-all group-hover:bg-sky/20 group-hover:scale-105">
                    <Play className="h-8 w-8 text-sky" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">Step 3: Automation Goes Live</h3>
                  <p className="text-sm text-muted-foreground">
                    Your automation runs smoothly, saving time and improving efficiency.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Client Automation Preview Workspace */}
          <section className="border-t border-border bg-background py-16">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                  <Eye className="h-4 w-4" />
                  Preview Before Deployment
                </span>
                <h2 className="section-title">Client Automation Preview Workspace</h2>
                <p className="section-subtitle mx-auto max-w-2xl">
                  Before deployment, we demonstrate your automation in a private preview workspace 
                  built specifically for your business.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    What You'll See
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Built on real automation logic",
                      "Matches your specific workflows",
                      "Live demo via screen-share or private link",
                      "Interactive testing with sample data",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security & Control
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Read-only preview (no editing controls)",
                      "No credential visibility",
                      "Private, non-public access",
                      "Controlled demo execution with test data",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Preview Trust Notice */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-12">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Secure Preview Environment</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This preview reflects near-production behavior using safe test data. 
                      Production credentials and live systems are connected only after client approval.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lifecycle */}
              <div className="text-center mb-8">
                <h3 className="font-semibold text-lg text-foreground mb-6">End-to-End Lifecycle</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {[
                    { step: "1", label: "Discovery & Requirements" },
                    { step: "2", label: "Build on Managed n8n" },
                    { step: "3", label: "Private Preview Demo" },
                    { step: "4", label: "Feedback & Approval" },
                    { step: "5", label: "Production Deployment" },
                  ].map((item, i) => (
                    <div key={item.step} className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                        {item.step}
                      </div>
                      <span className="text-sm text-foreground">{item.label}</span>
                      {i < 4 && <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Review & Approval */}
              <div className="rounded-2xl border border-border bg-card p-6 text-center max-w-2xl mx-auto">
                <CheckCircle className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg text-foreground mb-2">Review & Approval</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Clients review the preview, request refinements, and approve the automation before final deployment.
                </p>
                <p className="text-xs text-primary font-medium">
                  No automation is moved to production without explicit client confirmation.
                </p>
              </div>
            </div>
          </section>

          {/* LAYER 1: Individual AI Automations */}
          <section className="border-t border-border bg-background py-16">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <p className="section-label">Entry Level</p>
                <h2 className="section-title">Individual AI Automations</h2>
                <p className="section-subtitle mx-auto">
                  Start small. Buy exactly what you need.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {individualAutomations.map((automation) => (
                  <div
                    key={automation.name}
                    className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <automation.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{automation.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{automation.description}</p>
                    <p className="text-lg font-bold text-foreground mb-4">{automation.price}</p>
                    <div className="flex gap-2">
                      <a
                        href="https://wa.me/917889897488?text=Hi!%20I%27m%20interested%20in%20the%20" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-full bg-primary text-primary-foreground py-2.5 text-center text-sm font-semibold transition-all hover:shadow-md"
                      >
                        Buy Automation
                      </a>
                      {automation.hasDemo && (
                        <div className="flex flex-col items-center">
                          <Link
                            to="/playground"
                            className="rounded-full border border-primary/20 bg-card text-primary px-4 py-2.5 text-sm font-medium transition-all hover:border-primary/40 hover:bg-primary/5"
                          >
                            Try Demo
                          </Link>
                        </div>
                      )}
                    </div>
                    {automation.hasDemo && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Demos run in a secure sandbox environment.
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center mt-8 space-y-2">
                <p className="text-sm text-primary font-medium">
                  Upgrade anytime to a higher system — you only pay the difference.
                </p>
                <p className="text-xs text-muted-foreground">
                  Production automations require client credentials.
                </p>
              </div>
            </div>
          </section>

          {/* LAYER 2: AI Automation Systems (Bundles) */}
          <section className="border-t border-border gradient-hero-bg py-16">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <p className="section-label">Complete Systems</p>
                <h2 className="section-title">AI Automation Systems</h2>
                <p className="section-subtitle mx-auto">
                  Complete systems for serious growth.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {automationSystems.map((pkg) => (
                  <div
                    key={pkg.name}
                    className={`relative rounded-3xl border bg-card p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      pkg.popular ? "border-primary shadow-glow" : "border-border"
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                        Most Popular
                      </span>
                    )}
                    <div className="mb-6">
                      <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                        {pkg.tagline}
                      </p>
                      <h3 className="mb-2 text-2xl font-bold text-foreground">{pkg.name}</h3>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-foreground">{pkg.price}</span>
                        <span className="ml-2 text-muted-foreground">{pkg.period}</span>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{pkg.description}</p>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={pkg.ctaLink}
                      className={`block w-full rounded-full py-3 text-center font-semibold transition-all ${
                        pkg.popular
                          ? "btn-primary"
                          : "border border-primary/20 bg-card text-primary hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {pkg.cta}
                    </Link>
                    {(pkg.name === "Starter Automation" || pkg.name === "Pro Lead Engine") && (
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        Upgrade anytime to a higher system — you only pay the difference.
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Pricing Disclaimer */}
              <div className="mt-12 text-center max-w-2xl mx-auto">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Automation pricing covers setup and configuration only.<br />
                  Third-party software subscriptions, API usage costs, and optional ongoing hosting or maintenance are billed separately.
                </p>
              </div>
            </div>
          </section>

          {/* Optional Monthly Support Section */}
          <section className="border-t border-border bg-background py-12">
            <div className="mx-auto max-w-3xl px-4">
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-3">Optional Ongoing Support</h3>
                <p className="text-muted-foreground mb-6">
                  Keep your automations running smoothly with optional monitoring and maintenance.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    Automation health monitoring
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    Workflow updates & improvements
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    Error handling & fixes
                  </div>
                </div>
                <p className="text-lg font-bold text-foreground">
                  From <span className="text-primary">$49–$99</span> / month
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This is optional — all automations work independently after setup
                </p>
              </div>
            </div>
          </section>

          {/* LAYER 3: Custom AI Automation */}
          <section className="border-t border-border bg-background py-16">
            <div className="mx-auto max-w-4xl px-4">
              <div className="relative rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-secondary/5 p-8 md:p-12 shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50" />
                <div className="relative text-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                    <Workflow className="h-4 w-4" />
                    High-Ticket Solution
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Custom AI Automation
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Have a unique workflow or advanced requirement? We design fully custom AI automation 
                    systems tailored to your business — from complex integrations to enterprise-grade solutions.
                  </p>
                  <p className="text-xl font-bold text-foreground mb-8">
                    Starting from <span className="text-primary">$999</span>
                  </p>
                  <Link
                    to="/book-call"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Book Strategy Call
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing FAQ Section */}
          <section className="border-t border-border gradient-hero-bg py-16">
            <div className="mx-auto max-w-3xl px-4">
              <div className="text-center mb-10">
                <h2 className="section-title">Pricing Questions</h2>
              </div>
              <Accordion type="single" collapsible className="space-y-3">
                {pricingFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`pricing-${index}`}
                    className="rounded-2xl border border-border bg-card px-6 data-[state=open]:shadow-md transition-all"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* General FAQ Section */}
          <section className="border-t border-border bg-background py-16">
            <div className="mx-auto max-w-3xl px-4">
              <div className="text-center mb-10">
                <h2 className="section-title">Frequently Asked Questions</h2>
              </div>
              <Accordion type="single" collapsible className="space-y-3">
                {generalFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`general-${index}`}
                    className="rounded-2xl border border-border bg-card px-6 data-[state=open]:shadow-md transition-all"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* CTA Section */}
          <section className="border-t border-border bg-teal py-16">
            <div className="mx-auto max-w-4xl px-4 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Automate Your Business?
              </h2>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                Book a free strategy call. We'll map out your current processes and show you exactly what can be automated.
              </p>
              <Link
                to="/book-call"
                className="inline-flex items-center gap-2 rounded-full bg-background text-foreground px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Book Free Strategy Call
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AIAutomation;
