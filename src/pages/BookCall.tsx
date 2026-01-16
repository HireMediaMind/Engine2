import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Calendar, Clock, Video, CheckCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

const benefits = [
  "Personalized audit of your current marketing & automation",
  "Custom growth strategy tailored to your business",
  "Clear action plan with priority recommendations",
  "Pricing and timeline for your specific needs",
  "No pressure, no obligation — just value",
];

const BookCall = () => {
  return (
    <>
      <Helmet>
        <title>Book a Free Strategy Call - HireMediaMind</title>
        <meta
          name="description"
          content="Book a free 30-minute strategy call with HireMediaMind. Get a personalized audit and growth plan for your business."
        />
        <link rel="canonical" href="https://www.hiremediamind.com/book-call" />
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="gradient-hero-bg py-16">
            <div className="mx-auto max-w-6xl px-4">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Left Column - Info */}
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                    <Calendar className="h-4 w-4" />
                    Free Strategy Call
                  </span>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl mb-4">
                    Book Your Free 30-Min Growth Strategy Call
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Let's discuss your business goals and create a roadmap for scaling with 
                    performance marketing and AI automation.
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-foreground">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>30 minutes</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground">
                      <Video className="h-5 w-5 text-primary" />
                      <span>Google Meet / Zoom</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="font-semibold text-foreground mb-4">What you'll get:</h3>
                    <ul className="space-y-3">
                      {benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3 text-sm text-foreground">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 rounded-2xl bg-primary/10 p-6">
                    <p className="text-sm text-foreground">
                      <strong>Note:</strong> This call is for business owners and decision-makers 
                      who are serious about growth. Please come prepared to discuss your current 
                      situation, goals, and budget range.
                    </p>
                  </div>
                </div>

                {/* Right Column - Calendly Embed */}
                <div className="rounded-3xl border border-border bg-card p-2 shadow-lg">
                  <div className="rounded-2xl overflow-hidden bg-background">
                    {/* Calendly Inline Widget */}
                    <iframe
                      src="https://calendly.com/team-hiremediamind/30min"
                      width="100%"
                      height="700"
                      frameBorder="0"
                      title="Schedule a Strategy Call"
                      className="min-h-[600px]"
                    />
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-4 pb-2">
                    Can't find a suitable time?{" "}
                    <a
                      href="https://wa.me/918429889303?text=Hi,%20I%20couldn't%20find%20a%20suitable%20time%20on%20the%20calendar.%20Can%20we%20arrange%20a%20call?"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Message us on WhatsApp
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default BookCall;
