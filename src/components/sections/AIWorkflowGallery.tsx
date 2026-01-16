import { useState } from "react";
import { Workflow, Play, Eye, Zap, Bot, Mail, MessageSquare, ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const workflows = [
  {
    id: 1,
    title: "Lead Qualification AI",
    description: "Automatically scores and routes leads based on behavior and intent signals",
    icon: Bot,
    color: "primary",
    steps: ["Capture Lead", "AI Analysis", "Score & Route", "Notify Sales"],
    stats: { leads: "2,400+", accuracy: "94%", time: "< 2s" }
  },
  {
    id: 2,
    title: "Email Nurture Sequence",
    description: "AI-powered drip campaigns that adapt to user engagement",
    icon: Mail,
    color: "secondary",
    steps: ["Trigger Event", "Personalize Content", "Send Email", "Track & Adapt"],
    stats: { emails: "15K+", openRate: "42%", conversions: "8.2%" }
  },
  {
    id: 3,
    title: "WhatsApp Sales Bot",
    description: "24/7 conversational AI that qualifies and books appointments",
    icon: MessageSquare,
    color: "emerald",
    steps: ["Receive Message", "AI Response", "Qualify Lead", "Book Meeting"],
    stats: { conversations: "5,000+", bookings: "340+", satisfaction: "4.8/5" }
  },
  {
    id: 4,
    title: "Smart Retargeting",
    description: "Dynamic audience building based on real-time behavior",
    icon: Zap,
    color: "accent",
    steps: ["Track Behavior", "Segment Users", "Create Audience", "Launch Ads"],
    stats: { roas: "4.2x", cpa: "-35%", reach: "250K+" }
  }
];

export function AIWorkflowGallery() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<typeof workflows[0] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const runDemo = () => {
    if (!selectedWorkflow) return;
    setIsRunning(true);
    setCurrentStep(0);
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= selectedWorkflow.steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => setIsRunning(false), 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="relative mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="section-badge mb-4 inline-flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Live Automation Explorations
          </span>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-4">
            AI Orchestration Lab
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Explore our intelligent automation workflows. Click any card to see it in action.
          </p>
        </div>

        {/* Workflow Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {workflows.map((workflow, index) => (
            <div
              key={workflow.id}
              onClick={() => setSelectedWorkflow(workflow)}
              className="group cursor-pointer rounded-2xl glass-card-premium p-6 transition-all duration-500 hover:scale-[1.02] hover-glow-card stagger-animation"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-${workflow.color}/10 ring-1 ring-${workflow.color}/20 group-hover:ring-${workflow.color}/40 transition-all`}>
                <workflow.icon className={`h-7 w-7 text-${workflow.color}`} />
              </div>
              
              {/* Content */}
              <h3 className="mb-2 font-semibold text-foreground group-hover:text-primary transition-colors">
                {workflow.title}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                {workflow.description}
              </p>
              
              {/* Workflow Preview */}
              <div className="mb-4 flex items-center gap-1">
                {workflow.steps.map((_, stepIndex) => (
                  <div key={stepIndex} className="flex items-center">
                    <div className={`h-2 w-2 rounded-full bg-${workflow.color}/40 group-hover:bg-${workflow.color} transition-colors`} />
                    {stepIndex < workflow.steps.length - 1 && (
                      <div className={`h-px w-4 bg-${workflow.color}/20 group-hover:bg-${workflow.color}/40 transition-colors`} />
                    )}
                  </div>
                ))}
              </div>
              
              {/* CTA */}
              <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="h-4 w-4" />
                View Demo
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Demo Modal */}
        <Dialog open={!!selectedWorkflow} onOpenChange={() => { setSelectedWorkflow(null); setIsRunning(false); setCurrentStep(0); }}>
          <DialogContent className="max-w-2xl glass-card-premium">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                {selectedWorkflow && <selectedWorkflow.icon className="h-6 w-6 text-primary" />}
                {selectedWorkflow?.title}
              </DialogTitle>
            </DialogHeader>
            
            {selectedWorkflow && (
              <div className="space-y-6">
                <p className="text-muted-foreground">{selectedWorkflow.description}</p>
                
                {/* Workflow Steps Visualization */}
                <div className="rounded-xl bg-muted/30 p-6">
                  <div className="flex items-center justify-between">
                    {selectedWorkflow.steps.map((step, index) => (
                      <div key={index} className="flex flex-col items-center gap-2 flex-1">
                        <div className={`relative h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                          isRunning && index <= currentStep 
                            ? 'bg-primary text-primary-foreground scale-110 animate-pulse' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <span className="font-bold">{index + 1}</span>
                          {isRunning && index === currentStep && (
                            <div className="absolute inset-0 rounded-xl bg-primary/30 animate-ping" />
                          )}
                        </div>
                        <span className="text-xs text-center font-medium">{step}</span>
                        {index < selectedWorkflow.steps.length - 1 && (
                          <div className={`absolute h-0.5 w-full max-w-[60px] transition-all duration-500 ${
                            isRunning && index < currentStep ? 'bg-primary' : 'bg-border'
                          }`} style={{ left: '100%', top: '50%' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(selectedWorkflow.stats).map(([key, value]) => (
                    <div key={key} className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold gradient-text">{value}</p>
                      <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    </div>
                  ))}
                </div>
                
                {/* Run Demo Button */}
                <Button 
                  onClick={runDemo} 
                  disabled={isRunning}
                  className="w-full btn-primary"
                >
                  {isRunning ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Running Demo...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run a Demo
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
