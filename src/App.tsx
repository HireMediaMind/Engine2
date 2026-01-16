import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy } from "react";
import { LeadMagnetPopup } from "@/components/LeadMagnetPopup";
import { CookieConsent } from "@/components/CookieConsent";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { EmbedInjector } from "@/components/EmbedInjector";
import { AnnouncementBar } from "@/components/AnnouncementBar";

// Lazy load pages for performance
const Index = lazy(() => import("./pages/Index"));
const AIPlayground = lazy(() => import("./pages/AIPlayground"));
const MarketingSimulator = lazy(() => import("./pages/MarketingSimulator"));
const Calculator = lazy(() => import("./pages/Calculator"));
const About = lazy(() => import("./pages/About"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const PerformanceMarketing = lazy(() => import("./pages/PerformanceMarketing"));
const AIAutomation = lazy(() => import("./pages/AIAutomation"));
const BookCall = lazy(() => import("./pages/BookCall"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogGuide = lazy(() => import("./pages/BlogGuide"));
const Contact = lazy(() => import("./pages/Contact"));
const AILeadEngine = lazy(() => import("./pages/AILeadEngine"));
const LeadFinder = lazy(() => import("./pages/LeadFinder"));
const Login = lazy(() => import("./pages/admin/Login"));

// Admin Pages
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Leads = lazy(() => import("./pages/admin/Leads"));
const Pipeline = lazy(() => import("./pages/admin/Pipeline"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const EmailAutomation = lazy(() => import("./pages/admin/EmailAutomation"));
const WhatsAppAutomation = lazy(() => import("./pages/admin/WhatsAppAutomation"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const ChatbotConfig = lazy(() => import("./pages/admin/ChatbotConfig"));
const ChatbotKnowledge = lazy(() => import("./pages/admin/ChatbotKnowledge"));
const ChatbotSessions = lazy(() => import("./pages/admin/ChatbotSessions"));
const EmbedManager = lazy(() => import("./pages/admin/EmbedManager"));
const AnnouncementsOffers = lazy(() => import("./pages/admin/AnnouncementsOffers"));
const ClientPreviews = lazy(() => import("./pages/admin/ClientPreviews"));
const BlogList = lazy(() => import("./pages/admin/BlogList"));
const BlogEditor = lazy(() => import("./pages/admin/BlogEditor"));
const ClientPreview = lazy(() => import("./pages/ClientPreview"));
const AuthGuard = lazy(() => import("./components/admin/AuthGuard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// HR Module
const HRDashboard = lazy(() => import("./pages/admin/hr/HRDashboard"));
const Partners = lazy(() => import("./pages/admin/hr/Partners"));
const Employees = lazy(() => import("./pages/admin/hr/Employees"));
const Documents = lazy(() => import("./pages/admin/hr/Documents"));

// Growth Lab (Internal)
const GrowthOverview = lazy(() => import("./pages/admin/growth/GrowthOverview"));
const GrowthLeads = lazy(() => import("./pages/admin/growth/GrowthLeads"));
const GrowthAds = lazy(() => import("./pages/admin/growth/GrowthAds"));
const GrowthOutreach = lazy(() => import("./pages/admin/growth/GrowthOutreach"));
const GrowthLogs = lazy(() => import("./pages/admin/growth/GrowthLogs"));
const GrowthSettings = lazy(() => import("./pages/admin/growth/GrowthSettings"));
const GrowthEmbedManager = lazy(() => import("./pages/admin/growth/EmbedManager"));

const queryClient = new QueryClient();

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LeadMagnetPopup />
        <CookieConsent />
        <BrowserRouter>
          <AnnouncementBar />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/playground" element={<AIPlayground />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/about" element={<About />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/services/performance-marketing" element={<PerformanceMarketing />} />
              <Route path="/services/ai-automation" element={<AIAutomation />} />
              <Route path="/book-call" element={<BookCall />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/ai-lead-engine" element={<AILeadEngine />} />
              <Route path="/lead-finder" element={<LeadFinder />} />
              <Route path="/marketing-simulator" element={<MarketingSimulator />} />

              {/* Admin Routes - Protected */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<AuthGuard><Dashboard /></AuthGuard>} />
              <Route path="/admin/leads" element={<AuthGuard><Leads /></AuthGuard>} />
              <Route path="/admin/pipeline" element={<AuthGuard><Pipeline /></AuthGuard>} />
              <Route path="/admin/analytics" element={<AuthGuard><Analytics /></AuthGuard>} />
              <Route path="/admin/email" element={<AuthGuard><EmailAutomation /></AuthGuard>} />
              <Route path="/admin/whatsapp" element={<AuthGuard><WhatsAppAutomation /></AuthGuard>} />
              <Route path="/admin/settings" element={<AuthGuard><Settings /></AuthGuard>} />
              <Route path="/admin/chatbot" element={<AuthGuard><ChatbotConfig /></AuthGuard>} />
              <Route path="/admin/chatbot/knowledge" element={<AuthGuard><ChatbotKnowledge /></AuthGuard>} />
              <Route path="/admin/chatbot/sessions" element={<AuthGuard><ChatbotSessions /></AuthGuard>} />
              <Route path="/admin/embeds" element={<AuthGuard><EmbedManager /></AuthGuard>} />
              <Route path="/admin/announcements" element={<AuthGuard><AnnouncementsOffers /></AuthGuard>} />
              <Route path="/admin/previews" element={<AuthGuard><ClientPreviews /></AuthGuard>} />
              <Route path="/admin/blog" element={<AuthGuard><BlogList /></AuthGuard>} />
              <Route path="/admin/blog-editor" element={<AuthGuard><BlogEditor /></AuthGuard>} />
              <Route path="/admin/blog-guide" element={<AuthGuard><BlogGuide /></AuthGuard>} />

              {/* HR & Legal Module (v4.0) */}
              <Route path="/admin/hr" element={<AuthGuard><HRDashboard /></AuthGuard>} />
              <Route path="/admin/hr/partners" element={<AuthGuard><Partners /></AuthGuard>} />
              <Route path="/admin/hr/employees" element={<AuthGuard><Employees /></AuthGuard>} />
              <Route path="/admin/hr/documents" element={<AuthGuard><Documents /></AuthGuard>} />

              {/* Growth Lab (Internal) */}
              <Route path="/admin/growth" element={<AuthGuard><GrowthOverview /></AuthGuard>} />
              <Route path="/admin/growth/leads" element={<AuthGuard><GrowthLeads /></AuthGuard>} />
              <Route path="/admin/growth/ads" element={<AuthGuard><GrowthAds /></AuthGuard>} />
              <Route path="/admin/growth/outreach" element={<AuthGuard><GrowthOutreach /></AuthGuard>} />
              <Route path="/admin/growth/logs" element={<AuthGuard><GrowthLogs /></AuthGuard>} />
              <Route path="/admin/growth/settings" element={<AuthGuard><GrowthSettings /></AuthGuard>} />
              <Route path="/admin/growth/embed-manager" element={<AuthGuard><GrowthEmbedManager /></AuthGuard>} />

              {/* Public Preview Route */}
              <Route path="/preview/:token" element={<ClientPreview />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          {/* Global Chatbot Widget */}
          <ChatbotWidget />
          {/* Embed Injector for custom embeds */}
          <EmbedInjector />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
