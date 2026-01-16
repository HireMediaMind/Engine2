import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - HireMediaMind</title>
        <meta name="description" content="Privacy Policy for HireMediaMind website and services." />
        <link rel="canonical" href="https://www.hiremediamind.com/privacy" />
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-card py-16">
            <div className="mx-auto max-w-3xl px-4">
              <h1 className="mb-8 text-3xl font-bold text-foreground">Privacy Policy</h1>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">1. Information We Collect</h2>
                <p className="mb-4">
                  We collect information you provide directly to us, such as when you fill out a contact form,
                  request a consultation, or communicate with us. This may include your name, email address,
                  phone number, and company information.
                </p>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="mb-4 list-disc space-y-2 pl-6">
                  <li>Respond to your inquiries and provide customer service</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Improve our services and website</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">3. Information Sharing</h2>
                <p className="mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties
                  without your consent, except as required by law or to trusted partners who assist us
                  in operating our website and conducting our business.
                </p>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">4. Data Security</h2>
                <p className="mb-4">
                  We implement appropriate security measures to protect your personal information.
                  However, no method of transmission over the Internet is 100% secure.
                </p>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">5. GDPR Data Protection Rights</h2>
                <p className="mb-4">
                  We would like to make sure you are fully aware of all of your data protection rights.
                  Every user is entitled to the following:
                </p>
                <ul className="mb-4 list-disc space-y-2 pl-6">
                  <li>The right to access – You have the right to request copies of your personal data.</li>
                  <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
                  <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
                  <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                  <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
                  <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
                </ul>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">6. CCPA Compliance (California)</h2>
                <p className="mb-4">
                  Under the California Consumer Privacy Act (CCPA), California residents have specific rights regarding their personal information.
                  We do not sell your personal information. You have the right to request disclosure of data collection and deletion practices.
                </p>

                <h2 className="mb-3 mt-8 text-xl font-semibold text-foreground">7. Contact Us</h2>
                <p className="mb-4">
                  If you have questions about this Privacy Policy, please contact us via WhatsApp
                  or email at hello@hiremediamind.com.
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

export default Privacy;
