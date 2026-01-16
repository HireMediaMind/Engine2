import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Clock, 
  CheckCircle2, 
  Send, 
  Eye, 
  MousePointer, 
  ArrowRight,
  Play,
  RotateCcw,
  User,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutomationSimulatorProps {
  type: 'email' | 'whatsapp';
  onComplete: () => void;
}

interface EmailStep {
  id: number;
  day: number;
  subject: string;
  preview: string;
  status: 'pending' | 'sent' | 'opened' | 'clicked';
  openRate: number;
  clickRate: number;
}

const emailSequence: EmailStep[] = [
  {
    id: 1,
    day: 0,
    subject: "Welcome to HireMediaMind! 🎉",
    preview: "Thanks for your interest! Here's what to expect...",
    status: 'pending',
    openRate: 78,
    clickRate: 45
  },
  {
    id: 2,
    day: 2,
    subject: "3 Ways AI Can Grow Your Business",
    preview: "Discover how our clients save 20+ hours per week...",
    status: 'pending',
    openRate: 65,
    clickRate: 32
  },
  {
    id: 3,
    day: 4,
    subject: "Case Study: 5x ROAS in 90 Days",
    preview: "See how Brand X achieved remarkable results...",
    status: 'pending',
    openRate: 58,
    clickRate: 28
  },
  {
    id: 4,
    day: 7,
    subject: "Limited: Free Strategy Session",
    preview: "Book your personalized growth strategy call...",
    status: 'pending',
    openRate: 52,
    clickRate: 38
  }
];

export function AutomationSimulator({ type, onComplete }: AutomationSimulatorProps) {
  const [emails, setEmails] = useState<EmailStep[]>(emailSequence);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({ sent: 0, opened: 0, clicked: 0 });

  const runSimulation = async () => {
    setIsRunning(true);
    setEmails(emailSequence);
    setStats({ sent: 0, opened: 0, clicked: 0 });

    for (let i = 0; i < emails.length; i++) {
      setCurrentStep(i + 1);
      
      // Send
      await new Promise(r => setTimeout(r, 800));
      setEmails(prev => prev.map((e, idx) => 
        idx === i ? { ...e, status: 'sent' } : e
      ));
      setStats(prev => ({ ...prev, sent: prev.sent + 1 }));

      // Open (simulated delay)
      await new Promise(r => setTimeout(r, 600));
      if (Math.random() < emails[i].openRate / 100) {
        setEmails(prev => prev.map((e, idx) => 
          idx === i ? { ...e, status: 'opened' } : e
        ));
        setStats(prev => ({ ...prev, opened: prev.opened + 1 }));

        // Click
        await new Promise(r => setTimeout(r, 400));
        if (Math.random() < emails[i].clickRate / 100) {
          setEmails(prev => prev.map((e, idx) => 
            idx === i ? { ...e, status: 'clicked' } : e
          ));
          setStats(prev => ({ ...prev, clicked: prev.clicked + 1 }));
        }
      }

      await new Promise(r => setTimeout(r, 300));
    }

    setIsRunning(false);
    setCompleted(true);
    onComplete();
  };

  const resetSimulation = () => {
    setEmails(emailSequence);
    setCurrentStep(0);
    setCompleted(false);
    setStats({ sent: 0, opened: 0, clicked: 0 });
  };

  const getStatusIcon = (status: EmailStep['status']) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4 text-primary" />;
      case 'opened': return <Eye className="h-4 w-4 text-amber-500" />;
      case 'clicked': return <MousePointer className="h-4 w-4 text-emerald-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: EmailStep['status']) => {
    switch (status) {
      case 'sent': return 'bg-primary/10 text-primary border-primary/20';
      case 'opened': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'clicked': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Email Nurture Sequence</h2>
          <p className="text-muted-foreground">Watch how automated emails convert leads into customers</p>
        </div>
        <div className="flex items-center gap-3">
          {completed && (
            <Badge className="bg-emerald-500 text-white gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </Badge>
          )}
          <Button
            onClick={runSimulation}
            disabled={isRunning}
            className="btn-primary gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running...' : 'Run Sequence'}
          </Button>
          <Button
            onClick={resetSimulation}
            variant="outline"
            disabled={isRunning}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Email Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {emails.map((email, index) => (
            <Card 
              key={email.id}
              className={cn(
                "transition-all duration-300",
                currentStep === index + 1 && isRunning && "ring-2 ring-primary shadow-lg",
                email.status !== 'pending' && "border-primary/30"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                    getStatusColor(email.status)
                  )}>
                    {getStatusIcon(email.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        Day {email.day}
                      </Badge>
                      <Badge className={cn("text-xs", getStatusColor(email.status))}>
                        {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-foreground truncate">{email.subject}</h4>
                    <p className="text-sm text-muted-foreground truncate">{email.preview}</p>
                    
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {email.openRate}% open rate
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointer className="h-3 w-3" />
                        {email.clickRate}% click rate
                      </span>
                    </div>
                  </div>

                  {index < emails.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Emails Sent</span>
                <span className="text-2xl font-bold text-primary">{stats.sent}</span>
              </div>
              <Progress value={(stats.sent / 4) * 100} className="h-2" />
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Opened</span>
                <span className="text-xl font-bold text-amber-500">{stats.opened}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Clicked</span>
                <span className="text-xl font-bold text-emerald-500">{stats.clicked}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Simulation Lead
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Demo User</p>
                  <p className="text-xs text-muted-foreground">demo@example.com</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This simulates how a real lead moves through your email sequence
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Why Email Automation?</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Nurture leads 24/7 automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Personalized messages at scale</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>3x higher conversion rates</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}