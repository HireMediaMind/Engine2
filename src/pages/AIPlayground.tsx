import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Bot, 
  Workflow, 
  Mail, 
  MessageSquare, 
  Zap, 
  Lock, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Users,
  TrendingUp
} from 'lucide-react';
import { WorkflowVisualizer } from '@/components/playground/WorkflowVisualizer';
import { ChatbotDemo } from '@/components/playground/ChatbotDemo';
import { AutomationSimulator } from '@/components/playground/AutomationSimulator';
import { useGamification } from '@/hooks/useGamification';

const demos = [
  {
    id: 'chatbot',
    title: 'AI Chatbot Demo',
    description: 'Experience our intelligent chatbot that qualifies leads and books meetings',
    icon: Bot,
    badge: 'Popular',
    badgeColor: 'bg-emerald-500',
    status: 'available',
    xp: 25
  },
  {
    id: 'workflow',
    title: 'Workflow Automation',
    description: 'See how we automate lead nurturing and CRM updates',
    icon: Workflow,
    badge: 'Interactive',
    badgeColor: 'bg-sky-500',
    status: 'available',
    xp: 30
  },
  {
    id: 'email',
    title: 'Email Automation',
    description: 'Watch AI-powered email sequences in action',
    icon: Mail,
    badge: 'New',
    badgeColor: 'bg-amber-500',
    status: 'available',
    xp: 20
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Automation',
    description: 'Automated customer support via WhatsApp',
    icon: MessageSquare,
    badge: 'Premium',
    badgeColor: 'bg-purple-500',
    status: 'locked',
    xp: 40
  }
];

const AIPlayground = () => {
  const [activeDemo, setActiveDemo] = useState('chatbot');
  const { progress, badges, addXP, completedDemos, markDemoCompleted } = useGamification();

  const handleDemoComplete = (demoId: string, xp: number) => {
    if (!completedDemos.includes(demoId)) {
      addXP(xp);
      markDemoCompleted(demoId);
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Automation Playground - HireMediaMind</title>
        <meta name="description" content="Experience interactive AI automation demos. See chatbots, workflows, and email automation in action." />
        <link rel="canonical" href="https://www.hiremediamind.com/playground" />
      </Helmet>

      <div className="flex min-h-screen flex-col">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden py-16 sm:py-20">
            <div className="absolute inset-0 gradient-hero-bg opacity-50" />
            <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-secondary/10 blur-3xl animate-float-slow" />
            
            <div className="container relative z-10 mx-auto px-4">
              <div className="mx-auto max-w-3xl text-center">
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Interactive Demo Experience
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  AI Automation <span className="gradient-text">Playground</span>
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Experience our AI automation solutions hands-on. No signup required.
                </p>
              </div>

              {/* Gamification Progress */}
              <div className="mx-auto mt-8 max-w-md">
                <div className="rounded-xl bg-card border border-border p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Your Progress</span>
                    <span className="text-sm font-bold text-primary">{progress.xp} XP</span>
                  </div>
                  <Progress value={(progress.xp / progress.nextLevelXP) * 100} className="h-2" />
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Level {progress.level}</span>
                    <span>{completedDemos.length} of {demos.length} demos completed</span>
                  </div>
                  {badges.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {badges.map((badge, i) => (
                        <span key={i} className="text-lg" title={badge.name}>{badge.icon}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Demo Selection */}
          <section className="py-8 border-b border-border bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {demos.map((demo) => {
                  const Icon = demo.icon;
                  const isCompleted = completedDemos.includes(demo.id);
                  const isLocked = demo.status === 'locked';
                  
                  return (
                    <button
                      key={demo.id}
                      onClick={() => !isLocked && setActiveDemo(demo.id)}
                      disabled={isLocked}
                      className={`group relative rounded-xl p-4 text-left transition-all ${
                        activeDemo === demo.id 
                          ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]' 
                          : isLocked
                          ? 'bg-card opacity-60 cursor-not-allowed'
                          : 'bg-card hover:bg-card/80 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`rounded-lg p-2 ${
                          activeDemo === demo.id ? 'bg-white/20' : 'bg-muted'
                        }`}>
                          {isLocked ? (
                            <Lock className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          )}
                          <Badge className={`text-[10px] ${demo.badgeColor} text-white`}>
                            {demo.badge}
                          </Badge>
                        </div>
                      </div>
                      <h3 className="mt-3 font-semibold">{demo.title}</h3>
                      <p className={`mt-1 text-xs ${
                        activeDemo === demo.id ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                        {demo.description}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs">
                        <Zap className="h-3 w-3" />
                        <span>+{demo.xp} XP</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Active Demo Area */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              {activeDemo === 'chatbot' && (
                <ChatbotDemo onComplete={() => handleDemoComplete('chatbot', 25)} />
              )}
              {activeDemo === 'workflow' && (
                <WorkflowVisualizer onComplete={() => handleDemoComplete('workflow', 30)} />
              )}
              {activeDemo === 'email' && (
                <AutomationSimulator 
                  type="email" 
                  onComplete={() => handleDemoComplete('email', 20)} 
                />
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Ready to Automate Your Business?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Get a custom AI automation strategy for your business. Book a free consultation.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="btn-primary" asChild>
                  <a href="/book-call">
                    Book Strategy Call
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/pricing">View Pricing</a>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AIPlayground;