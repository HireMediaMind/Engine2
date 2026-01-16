import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { WhoWeHelp } from "@/components/sections/WhoWeHelp";
import { Services } from "@/components/sections/Services";
import { AIWorkflowGallery } from "@/components/sections/AIWorkflowGallery";
import { ImpactSimulator } from "@/components/sections/ImpactSimulator";
import { FAQ } from "@/components/sections/FAQ";
import { ContactForm } from "@/components/sections/ContactForm";
import { CTA } from "@/components/sections/CTA";
import { Helmet } from "react-helmet-async";

const Index = () => {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "HireMediaMind",
    "url": "https://www.hiremediamind.com",
    "logo": "https://www.hiremediamind.com/favicon.png",
    "description": "Leading AI automation and performance marketing agency helping businesses worldwide scale with Facebook Ads, Google Ads, YouTube Ads, and intelligent automation solutions.",
    "sameAs": [
      "https://www.linkedin.com/company/hiremediamind",
      "https://www.instagram.com/hiremediamind"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-8429889303",
      "contactType": "sales",
      "availableLanguage": ["English", "Hindi"]
    },
    "areaServed": [
      { "@type": "Country", "name": "United States" },
      { "@type": "Country", "name": "United Kingdom" },
      { "@type": "Country", "name": "United Arab Emirates" },
      { "@type": "Country", "name": "Canada" },
      { "@type": "Country", "name": "Australia" },
      { "@type": "Country", "name": "New Zealand" },
      { "@type": "Country", "name": "Ireland" },
      { "@type": "Country", "name": "Singapore" },
      { "@type": "Country", "name": "Germany" },
      { "@type": "Country", "name": "Switzerland" },
      { "@type": "Country", "name": "Denmark" },
      { "@type": "Country", "name": "India" }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Digital Marketing Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Automation Solutions",
            "description": "Custom AI chatbots, WhatsApp automation, and workflow automation for business growth"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Performance Marketing",
            "description": "Facebook Ads, Google Ads, Instagram Ads, YouTube Ads management with proven ROI"
          }
        }
      ]
    }
  };

  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "HireMediaMind - AI Marketing Agency",
    "image": "https://www.hiremediamind.com/favicon.png",
    "url": "https://www.hiremediamind.com",
    "telephone": "+91-8429889303",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "28.6139",
      "longitude": "77.2090"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  };

  return (
    <>
      <Helmet>
        <title>HireMediaMind - #1 AI Automation & Performance Marketing Agency | Global Services</title>
        <meta
          name="description"
          content="HireMediaMind is a leading AI automation and performance marketing agency. Expert Facebook Ads, Google Ads, Instagram Ads, YouTube Ads, AI chatbots, WhatsApp automation. Serving USA, UK, UAE, Canada, Australia, Singapore & 50+ countries. Book free strategy call today!"
        />
        <meta
          name="keywords"
          content="AI automation agency, performance marketing agency, Facebook ads agency, Google ads management, Instagram ads expert, YouTube ads agency, AI chatbot development, WhatsApp automation, lead generation agency, CRM automation, digital marketing agency USA, marketing agency UK, ads agency UAE, performance marketing Canada, AI marketing Australia, chatbot agency Singapore, workflow automation, business automation, paid advertising agency, social media marketing, PPC management, conversion optimization, marketing automation, ROI marketing, data-driven marketing"
        />
        <link rel="canonical" href="https://www.hiremediamind.com/" />
        
        {/* Open Graph */}
        <meta property="og:title" content="HireMediaMind - AI Automation & Performance Marketing Agency" />
        <meta property="og:description" content="Scale your business globally with AI-powered marketing automation. Expert Facebook, Google, Instagram & YouTube Ads. Serving US, UK, UAE, Canada, Australia & 50+ countries." />
        <meta property="og:url" content="https://www.hiremediamind.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="HireMediaMind" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content="https://www.hiremediamind.com/apple-touch-icon.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HireMediaMind - AI Marketing Agency" />
        <meta name="twitter:description" content="AI automation & performance marketing for global business growth" />
        
        {/* International Targeting */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <link rel="alternate" hrefLang="en" href="https://www.hiremediamind.com/" />
        <link rel="alternate" hrefLang="en-US" href="https://www.hiremediamind.com/" />
        <link rel="alternate" hrefLang="en-GB" href="https://www.hiremediamind.com/" />
        <link rel="alternate" hrefLang="en-AU" href="https://www.hiremediamind.com/" />
        <link rel="alternate" hrefLang="en-CA" href="https://www.hiremediamind.com/" />
        <link rel="alternate" hrefLang="en-SG" href="https://www.hiremediamind.com/" />
        <link rel="alternate" hrefLang="en-AE" href="https://www.hiremediamind.com/" />
        <link rel="alternate" hrefLang="x-default" href="https://www.hiremediamind.com/" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(localBusinessData)}
        </script>
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main>
          <Hero />
          <WhoWeHelp />
          <Services />
          <AIWorkflowGallery />
          <ImpactSimulator />
          <FAQ />
          <ContactForm />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
