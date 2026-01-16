import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Check, TrendingUp, BarChart3, Target, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const packages = [
  {
    name: "Starter Performance Marketing",
    price: "$497",
    period: "/month",
    tagline: "For businesses starting paid ads",
    description: "Testing demand or launching your first campaigns? Start here.",
    features: [
      "1 Ad Platform (Google OR Meta)",
      "Campaign setup & management",
      "Conversion tracking setup",
      "Weekly performance reports",
      "Email support",
    ],
    cta: "Book Strategy Call",
    popular: false,
  },
  {
    name: "Growth Performance Marketing",
    price: "$997",
    period: "/month",
    tagline: "For businesses ready to scale",
    description: "Multi-channel campaigns for serious lead and sales growth.",
    features: [
      "Google + Meta Ads",
      "Multiple campaigns & creatives",
      "Funnel & landing page optimization",
      "Advanced tracking & A/B testing",
      "Bi-weekly strategy calls",
      "Performance dashboard",
    ],
    cta: "Book Strategy Call",
    popular: true,
  },
  {
    name: "Scale Performance System",
    price: "From $1,997",
    period: "/month",
    tagline: "For established businesses",
    description: "Enterprise-grade performance marketing for high-volume growth.",
    features: [
      "Multi-platform advertising",
      "Full funnel & CRO strategy",
      "AI & automation support",
      "Dedicated account manager",
    ],
    cta: "Book Strategy Call",
    popular: false,
  },
];

const platforms = [
  { name: "Meta Ads", desc: "Facebook & Instagram", icon: "📱" },
  { name: "Google Ads", desc: "Search & Display", icon: "🔍" },
  { name: "YouTube Ads", desc: "Video campaigns", icon: "▶️" },
  { name: "LinkedIn Ads", desc: "B2B targeting", icon: "💼" },
];

const faqs = [
  {
    question: "What about ad spend?",
    answer: "Ad spend is paid directly to the advertising platforms (Meta, Google, etc.). Our pricing covers campaign management, strategy, and optimization only.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer: "Absolutely. You can upgrade at any time. We'll seamlessly transition your campaigns to the new package without any disruption.",
  },
  {
    question: "How quickly can I see results?",
    answer: "Most clients see initial data within 48-72 hours. We recommend 2-4 weeks for proper testing and optimization. Significant ROI improvements typically occur within 30-60 days.",
  },
  {
    question: "Do you create ad creatives?",
    answer: "Yes. Growth and Scale packages include creative strategy and production. For Starter, we provide creative guidelines and support.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, all packages are month-to-month with no long-term contracts. We require 30 days notice for cancellation.",
  },
];

const PerformanceMarketing = () => {
  return (
    <>
      <Helmet>
        <title>Performance Marketing Services - HireMediaMind | Meta & Google Ads Agency</title>
        <meta
          name="description"
          content="Turn $1 into $3-$5 with our performance marketing services. Expert Meta Ads, Google Ads, and YouTube advertising. Packages from $497/month."
        />
        <meta
          name="keywords"
          content="performance marketing agency, Facebook ads expert, Google ads management, PPC agency, paid advertising, ROAS optimization"
        />
        <link rel="canonical" href="https://www.hiremediamind.com/services/performance-marketing" />
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="gradient-hero-bg relative overflow-hidden py-20">
            <div className="absolute inset-0 bg-gradient-to-br from-sky/5 via-transparent to-teal/5" />
            <div className="mx-auto max-w-6xl px-4 relative">
              <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                  <TrendingUp className="h-4 w-4" />
                  Performance Marketing
                </span>
                <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl mb-6">
                  We help brands turn{" "}
                  <span className="text-gradient">$1 into $3–$5</span> using paid ads
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Done-for-you campaigns on Meta, Google, and YouTube that turn ad spend into measurable, 
                  predictable profit. No guesswork, just results.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/book-call" className="btn-primary inline-flex items-center gap-2">
                    Book Free Strategy Call
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/calculator" className="btn-secondary inline-flex items-center gap-2">
                    Calculate Your ROAS
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Platforms Section */}
          <section className="border-t border-border bg-background py-12">
            <div className="mx-auto max-w-6xl px-4">
              <p className="text-center text-sm font-medium text-muted-foreground mb-8">
                PLATFORMS WE MASTER
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {platforms.map((platform) => (
                  <div
                    key={platform.name}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 text-center transition-all hover:shadow-md hover:border-primary/30"
                  >
                    <span className="text-3xl">{platform.icon}</span>
                    <h3 className="font-semibold text-foreground">{platform.name}</h3>
                    <p className="text-xs text-muted-foreground">{platform.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* What's Included */}
          <section className="border-t border-border gradient-hero-bg py-16">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <h2 className="section-title">What's Included in Every Package</h2>
                <p className="section-subtitle mx-auto">
                  Everything you need to run profitable ad campaigns
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-border bg-card p-6 transition-all hover:shadow-lg">
                  <div className="h-12 w-12 rounded-2xl bg-sky/20 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-sky" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Campaign Strategy</h3>
                  <p className="text-sm text-muted-foreground">
                    Custom audience research, competitor analysis, and campaign architecture designed for your specific business goals.
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-card p-6 transition-all hover:shadow-lg">
                  <div className="h-12 w-12 rounded-2xl bg-teal/20 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-teal" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Tracking & Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete pixel setup, conversion tracking, and GA4 integration so you know exactly what's working.
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-card p-6 transition-all hover:shadow-lg">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Continuous Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Daily monitoring, A/B testing, and bid adjustments to maximize your return on ad spend.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="border-t border-border bg-background py-16">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <p className="section-label">Pricing</p>
                <h2 className="section-title">Choose Your Growth Path</h2>
                <p className="section-subtitle mx-auto">
                  Transparent pricing with no hidden fees. Ad spend paid directly to platforms.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className={`relative rounded-3xl border bg-card p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${
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
                        <span className="ml-1 text-muted-foreground">{pkg.period}</span>
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
                      to="/book-call"
                      className={`block w-full rounded-full py-3 text-center font-semibold transition-all ${
                        pkg.popular
                          ? "btn-primary"
                          : "border border-primary/20 bg-card text-primary hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {pkg.cta}
                    </Link>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                All prices in USD. Ad spend is paid directly to platforms and is not included in these fees.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="border-t border-border gradient-hero-bg py-16">
            <div className="mx-auto max-w-3xl px-4">
              <div className="text-center mb-12">
                <h2 className="section-title">Frequently Asked Questions</h2>
              </div>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="rounded-2xl border border-border bg-card px-6 data-[state=open]:shadow-md"
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
          <section className="border-t border-border bg-primary py-16">
            <div className="mx-auto max-w-4xl px-4 text-center">
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                Ready to Scale Your Ads Profitably?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Book a free 30-minute strategy call. We'll analyze your current setup and show you exactly how to improve your ROAS.
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

export default PerformanceMarketing;
