import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - HireMediaMind | AI-Powered Marketing Agency</title>
        <meta
          name="description"
          content="Learn about HireMediaMind - a leading AI automation and performance marketing agency helping businesses scale globally."
        />
        <link rel="canonical" href="https://www.hiremediamind.com/about" />
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="gradient-hero-bg py-16">
            <div className="mx-auto max-w-4xl px-4">
              <div className="mb-12 text-center">
                <p className="section-label">About Us</p>
                <h1 className="section-title text-3xl md:text-4xl">
                  Building Growth Systems, Not Just Running Ads
                </h1>
              </div>

              <div className="space-y-8">
                <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
                  <h2 className="mb-4 text-xl font-bold text-foreground">Our Mission</h2>
                  <p className="text-muted-foreground">
                    We help service businesses, coaches, and online brands build predictable, scalable growth systems
                    that combine the power of performance marketing with intelligent automation. Our goal is to turn
                    your marketing from a cost center into a profit engine that works 24/7.
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
                  <h2 className="mb-4 text-xl font-bold text-foreground">Why We're Different</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="card-sky rounded-2xl p-4">
                      <h3 className="mb-2 font-semibold text-foreground">Performance-First</h3>
                      <p className="text-sm text-muted-foreground">
                        We measure success in revenue and ROAS, not vanity metrics like impressions or clicks.
                      </p>
                    </div>
                    <div className="card-emerald rounded-2xl p-4">
                      <h3 className="mb-2 font-semibold text-foreground">AI-Powered</h3>
                      <p className="text-sm text-muted-foreground">
                        We use AI and automation to work smarter, reducing manual effort while improving results.
                      </p>
                    </div>
                    <div className="card-emerald rounded-2xl p-4">
                      <h3 className="mb-2 font-semibold text-foreground">Global Reach</h3>
                      <p className="text-sm text-muted-foreground">
                        We serve clients in US, UK, UAE, Germany, Australia, and worldwide.
                      </p>
                    </div>
                    <div className="card-sky rounded-2xl p-4">
                      <h3 className="mb-2 font-semibold text-foreground">Transparent</h3>
                      <p className="text-sm text-muted-foreground">
                        Clear pricing, honest reporting, and regular communication. No hidden fees or jargon.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
                  <h2 className="mb-4 text-xl font-bold text-foreground">Our Values</h2>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      <span><strong className="text-foreground">Results Over Activity:</strong> We focus on outcomes, not busy work.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      <span><strong className="text-foreground">Continuous Improvement:</strong> We test, learn, and optimize constantly.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      <span><strong className="text-foreground">Partnership Mindset:</strong> Your success is our success.</span>
                    </li>
                  </ul>
                </div>

                <div className="text-center">
                  <a
                    href="https://wa.me/918429889303?text=Hi,%20I%27d%20like%20to%20learn%20more%20about%20working%20with%20HireMediaMind."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex"
                  >
                    Let's Talk
                  </a>
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

export default About;
