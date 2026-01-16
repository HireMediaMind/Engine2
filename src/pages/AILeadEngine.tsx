import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Zap, Bot, Mail, Calendar, CreditCard, ArrowRight, Shield, Clock, TrendingUp } from "lucide-react";

const problems = [
  "Leads slip through the cracks because you forget to follow up",
  "You're manually sending WhatsApp messages one by one",
  "Booking calls takes 10+ back-and-forth messages",
  "You have no idea which leads are hot or cold",
  "Revenue is unpredictable because your pipeline is messy",
];

const solutions = [
  { icon: Bot, title: "Auto Lead Capture", desc: "Every form submission instantly goes to your CRM + WhatsApp" },
  { icon: Mail, title: "7-Day Nurture Sequence", desc: "Automated emails that warm up leads while you sleep" },
  { icon: Calendar, title: "Smart Booking System", desc: "Leads book calls directly — no back-and-forth needed" },
  { icon: CreditCard, title: "Payment Automation", desc: "Send invoices and collect payments automatically" },
];

const includes = [
  "Complete CRM pipeline setup (6 stages)",
  "WhatsApp auto-reply templates",
  "7-day email nurture sequence",
  "Booking calendar integration",
  "Lead scoring system",
  "Payment collection workflow",
  "Follow-up reminder automations",
  "Video training (setup guide)",
  "30-day email support",
];

const AILeadEngine = () => {
  return (
    <>
      <Helmet>
        <title>AI Lead Engine - Automated Revenue System | HireMediaMind</title>
        <meta
          name="description"
          content="Turn leads into revenue on autopilot with AI Lead Engine. Complete automation system for lead capture, nurturing, booking, and payment collection."
        />
        <link rel="canonical" href="https://hiremediamind.com/ai-lead-engine" />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-teal-200/30 to-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-amber-200/20 to-teal-200/20 rounded-full blur-3xl" />
          
          <div className="container relative z-10 mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block px-4 py-2 mb-6 text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full">
                🚀 Digital Product
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-teal-800 to-emerald-700 bg-clip-text text-transparent">
                AI Lead Engine
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-4">
                The Complete Automation System That Turns Leads Into Revenue
              </p>
              <p className="text-lg text-gray-500 mb-8">
                While You Sleep, Travel, or Focus on What You Love
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <div className="text-center">
                  <p className="text-sm text-gray-500 line-through">Regular: $997</p>
                  <p className="text-4xl font-bold text-teal-600">$497</p>
                  <p className="text-sm text-amber-600 font-medium">Launch Offer - 50% Off</p>
                </div>
              </div>
              
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Instant Access <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
                Does This Sound Like You?
              </h2>
              <p className="text-gray-600 text-center mb-12">
                You're working hard, but leads keep slipping away...
              </p>
              
              <div className="space-y-4">
                {problems.map((problem, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-red-50 rounded-2xl border border-red-100"
                  >
                    <span className="text-red-500 text-xl">❌</span>
                    <p className="text-gray-700">{problem}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-teal-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
                Introducing AI Lead Engine
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                A complete done-for-you automation system that captures leads, nurtures them, 
                books calls, and collects payments — all on autopilot.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {solutions.map((solution, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-teal-100"
                  >
                    <div className="w-14 h-14 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                      <solution.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{solution.title}</h3>
                    <p className="text-gray-600">{solution.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
                Everything You Get
              </h2>
              <p className="text-gray-600 text-center mb-12">
                Complete automation stack — ready to deploy
              </p>
              
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-8 rounded-3xl border border-teal-100">
                <div className="grid gap-4">
                  {includes.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-emerald-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                Why Businesses Love AI Lead Engine
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-md text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Save 20+ Hours/Week</h3>
                  <p className="text-gray-600">Stop doing manual follow-ups. Let automation handle it.</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-md text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">3x More Conversions</h3>
                  <p className="text-gray-600">Never miss a follow-up. Convert more leads into customers.</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-md text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Works 24/7</h3>
                  <p className="text-gray-600">Your automation runs while you sleep, travel, or relax.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guarantee */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                30-Day Money-Back Guarantee
              </h2>
              <p className="text-gray-600 mb-6">
                Try AI Lead Engine risk-free. If you don't see value in the first 30 days, 
                we'll refund every penny. No questions asked.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Automate Your Revenue?
              </h2>
              <p className="text-teal-100 text-lg mb-8">
                Join 100+ businesses already using AI Lead Engine
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8">
                <div className="text-center">
                  <p className="text-teal-200 line-through">Regular: $997</p>
                  <p className="text-5xl font-bold text-white mb-2">$497</p>
                  <p className="text-amber-300 font-medium">Launch Price — Limited Time</p>
                </div>
              </div>
              
              <Button
                size="lg"
                className="bg-white text-teal-600 hover:bg-gray-100 px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Instant Access Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <p className="text-teal-200 text-sm mt-6">
                Want us to implement it for you? <a href="/book-call" className="text-white underline hover:no-underline">Book a strategy call</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AILeadEngine;
