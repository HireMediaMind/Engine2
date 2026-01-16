import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";

const caseStudies = [
  {
    category: "Coaching Business",
    location: "United States",
    title: "From Inconsistent Leads to 30+ Qualified Calls Per Month",
    challenge: "A high-ticket coaching business was struggling with inconsistent lead flow and low-quality leads.",
    solution: "We implemented a multi-channel approach with Meta + YouTube ads, combined with WhatsApp automation for lead qualification.",
    results: [
      "30+ qualified calls per month",
      "65% reduction in cost per lead",
      "3.2x ROAS within 60 days",
    ],
    bgClass: "card-sky",
  },
  {
    category: "Medical Clinic",
    location: "Germany",
    title: "35% Reduction in Cost Per Lead Within 60 Days",
    challenge: "A local clinic was spending too much on Google Ads with declining patient inquiries.",
    solution: "We rebuilt their campaigns with better targeting, optimized their landing page, and added automated appointment reminders.",
    results: [
      "35% lower cost per lead",
      "45% increase in appointment bookings",
      "80% reduction in no-shows with automation",
    ],
    bgClass: "card-emerald",
  },
  {
    category: "Online Course Creator",
    location: "Global",
    title: "18% Extra Revenue from \"Old Leads\"",
    challenge: "An established course creator had thousands of old leads sitting unused in their CRM.",
    solution: "We created reactivation campaigns with personalized email and WhatsApp sequences, plus automated upsell flows.",
    results: [
      "18% increase in revenue from existing database",
      "$47,000 in additional revenue in 90 days",
      "Fully automated follow-up system",
    ],
    bgClass: "card-sky",
  },
  {
    category: "E-commerce Brand",
    location: "United Kingdom",
    title: "Scaled from £10K to £50K/month in Ad Spend Profitably",
    challenge: "A growing D2C brand wanted to scale but couldn't maintain ROAS at higher spend levels.",
    solution: "We restructured their Meta campaigns, implemented creative testing, and built a retention automation system.",
    results: [
      "5x increase in ad spend while maintaining 3.8x ROAS",
      "42% increase in repeat purchase rate",
      "£180K revenue in first quarter",
    ],
    bgClass: "card-emerald",
  },
];

const CaseStudies = () => {
  return (
    <>
      <Helmet>
        <title>Case Studies - HireMediaMind | Real Results for Real Businesses</title>
        <meta
          name="description"
          content="See how we've helped businesses achieve real results with performance marketing and AI automation."
        />
        <link rel="canonical" href="https://www.hiremediamind.com/case-studies" />
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="gradient-hero-bg py-16">
            <div className="mx-auto max-w-6xl px-4">
              <div className="mb-12 text-center">
                <p className="section-label">Case Studies</p>
                <h1 className="section-title text-3xl md:text-4xl">Real Results for Real Businesses</h1>
                <p className="section-subtitle mx-auto">
                  Every business is different, but the goal is always the same: trackable, profitable growth.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {caseStudies.map((study) => (
                  <div
                    key={study.title}
                    className={`${study.bgClass} rounded-3xl border border-border p-6 shadow-lg transition-all duration-300 hover:shadow-xl`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="section-label mb-0">{study.category}</span>
                      <span className="text-xs text-muted-foreground">{study.location}</span>
                    </div>
                    <h2 className="mb-4 text-lg font-bold text-foreground">{study.title}</h2>
                    
                    <div className="mb-4">
                      <h3 className="mb-1 text-sm font-semibold text-foreground">Challenge</h3>
                      <p className="text-sm text-muted-foreground">{study.challenge}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="mb-1 text-sm font-semibold text-foreground">Solution</h3>
                      <p className="text-sm text-muted-foreground">{study.solution}</p>
                    </div>
                    
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-foreground">Results</h3>
                      <ul className="space-y-1">
                        {study.results.map((result) => (
                          <li key={result} className="flex items-start gap-2 text-sm text-foreground">
                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                            {result}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="mb-4 text-muted-foreground">
                  Ready to become our next success story?
                </p>
                <a
                  href="https://wa.me/918429889303?text=Hi,%20I%27ve%20seen%20your%20case%20studies%20and%20would%20like%20to%20discuss%20my%20business."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex"
                >
                  Book Your Strategy Call
                </a>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CaseStudies;
