import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - HireMediaMind</title>
        <meta name="description" content="Terms of Service for HireMediaMind website and services." />
        <link rel="canonical" href="https://www.hiremediamind.com/terms" />
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-card py-16">
            <div className="mx-auto max-w-3xl px-4">
              <h1 className="mb-8 text-3xl font-bold text-foreground">Terms of Service</h1>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">1. Agreement to Terms</h2>
                <p className="mb-4">
                  By accessing or using our services, you agree to be bound by these Terms of Service
                  and our Privacy Policy.
                </p>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">2. Our Services</h2>
                <p className="mb-4">
                  HireMediaMind provides performance marketing and AI automation services. The specific
                  services, deliverables, and pricing will be outlined in individual service agreements.
                </p>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">3. Payment Terms</h2>
                <p className="mb-4">
                  Payment terms will be specified in your service agreement. Ad spend is paid directly
                  to advertising platforms (Meta, Google, etc.) and is separate from our management fees.
                </p>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">4. Client Responsibilities</h2>
                <p className="mb-4">You agree to:</p>
                <ul className="mb-4 list-disc space-y-2 pl-6">
                  <li>Provide accurate information and timely feedback</li>
                  <li>Maintain necessary account access and permissions</li>
                  <li>Comply with advertising platform policies</li>
                  <li>Pay fees as agreed</li>
                </ul>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">5. Results Disclaimer</h2>
                <p className="mb-4">
                  While we strive to achieve the best results, we cannot guarantee specific outcomes.
                  Marketing results depend on many factors including market conditions, offer quality,
                  and ad spend levels.
                </p>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">6. Intellectual Property</h2>
                <p className="mb-4">
                  We retain ownership of our methodologies, tools, and processes. You retain ownership
                  of your brand assets and business data.
                </p>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
                <p className="mb-4">
                  Our liability is limited to the fees paid for services. We are not liable for indirect,
                  incidental, or consequential damages.
                </p>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">8. Governing Law</h2>
                <p className="mb-4">
                  These terms shall be governed by and defined following the laws of India. HireMediaMind and yourself irrevocably
                  consent that the courts of Delhi, India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
                </p>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">9. Contact</h2>
                <p className="mb-4">
                  For questions about these terms, contact us via WhatsApp or email at hello@hiremediamind.com.
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Terms;
