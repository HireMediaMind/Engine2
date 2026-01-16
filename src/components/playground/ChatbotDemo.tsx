import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAndSanitizeMessage } from '@/lib/sanitize';

interface ChatbotDemoProps {
  onComplete: () => void;
}

interface Message {
  role: 'user' | 'bot';
  content: string;
}

const demoResponses: Record<string, string> = {
  default: "I'm Maya, the AI assistant demo! I can help you understand how our chatbots work. Try asking about:\n\n• Performance Marketing\n• AI Automation\n• Pricing\n• Booking a call",
  marketing: "**Performance Marketing** is our core service! 🎯\n\nWe help businesses generate leads at scale using:\n• Meta Ads (Facebook/Instagram)\n• Google Ads (Search/Display)\n• Landing page optimization\n\nOur clients typically see **3-5x ROAS** within 90 days. Would you like to know about pricing?",
  automation: "**AI Automation** saves our clients 10-20 hours per week! 🤖\n\nWe build:\n• Smart chatbots (like me!)\n• Lead nurturing workflows\n• CRM integrations\n• Email/WhatsApp automation\n\nMost clients see ROI within 30 days!",
  pricing: "Here's our pricing overview: 💰\n\n**Performance Marketing**: From $997/month\n**AI Automation**: From $497 setup + $97/month\n**AI Lead Engine**: $497 one-time\n\nWant to discuss your specific needs?",
  book: "I'd love to help you book a call! 📅\n\nOur strategy calls are **30 minutes** where we:\n✅ Analyze your current setup\n✅ Identify growth opportunities\n✅ Create an action plan\n\n*Click the button below to schedule!*",
  hi: "Hello! 👋 Great to meet you!\n\nI'm Maya, an AI assistant demo. I showcase how our chatbots can:\n• Qualify leads automatically\n• Answer FAQs 24/7\n• Book meetings\n• Collect contact info\n\nWhat would you like to explore?",
  hello: "Hey there! 👋 Welcome!\n\nI'm here to show you how AI chatbots can transform your business. Ask me anything about our services!"
};

export function ChatbotDemo({ onComplete }: ChatbotDemoProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      content: "Hi! I'm Maya, a demo of our AI chatbot. 👋\n\nThis is how your customers would interact with an AI assistant on your website.\n\nTry asking me about:\n• Performance Marketing\n• AI Automation\n• Pricing" 
    }
  ]);
  const [input, setInput] = useState('');
  const [completed, setCompleted] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  const getResponse = (message: string): string => {
    const lower = message.toLowerCase();
    
    if (lower.includes('marketing') || lower.includes('ads') || lower.includes('ppc')) {
      return demoResponses.marketing;
    }
    if (lower.includes('automation') || lower.includes('chatbot') || lower.includes('workflow')) {
      return demoResponses.automation;
    }
    if (lower.includes('price') || lower.includes('cost') || lower.includes('pricing')) {
      return demoResponses.pricing;
    }
    if (lower.includes('book') || lower.includes('call') || lower.includes('meeting')) {
      return demoResponses.book;
    }
    if (lower.includes('hi') || lower.includes('hey')) {
      return demoResponses.hi;
    }
    if (lower.includes('hello')) {
      return demoResponses.hello;
    }
    
    return demoResponses.default;
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const botResponse: Message = { role: 'bot', content: getResponse(input) };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInput('');
    
    const newCount = interactionCount + 1;
    setInteractionCount(newCount);

    if (newCount >= 3 && !completed) {
      setCompleted(true);
      onComplete();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = ['Performance Marketing', 'AI Automation', 'Pricing', 'Book a Call'];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Demo Chat */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Maya AI</CardTitle>
                <CardDescription className="text-white/80">Demo Chatbot</CardDescription>
              </div>
            </div>
            {completed && (
              <Badge className="bg-white/20 text-white gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Demo Complete
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[350px] p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex animate-fade-in",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    "flex items-start gap-2 max-w-[85%]",
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  )}>
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      message.role === 'user' ? 'bg-primary' : 'bg-muted'
                    )}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-foreground" />
                      )}
                    </div>
                    <div className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm",
                      message.role === 'user' 
                        ? 'bg-primary text-white rounded-br-sm' 
                        : 'bg-muted text-foreground rounded-bl-sm'
                    )}>
                      <div 
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: formatAndSanitizeMessage(message.content)
                        }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="border-t border-border p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setInput(action);
                    setTimeout(sendMessage, 100);
                  }}
                >
                  {action}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="rounded-full"
              />
              <Button
                onClick={sendMessage}
                size="icon"
                className="rounded-full shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">1</div>
              <div>
                <h4 className="font-medium">Visitor Engages</h4>
                <p className="text-sm text-muted-foreground">AI chatbot greets visitors and starts conversation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">2</div>
              <div>
                <h4 className="font-medium">AI Qualifies Lead</h4>
                <p className="text-sm text-muted-foreground">Collects name, email, interest and scores the lead</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">3</div>
              <div>
                <h4 className="font-medium">Books Meeting</h4>
                <p className="text-sm text-muted-foreground">Schedules call and syncs with your calendar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">4</div>
              <div>
                <h4 className="font-medium">You Get Notified</h4>
                <p className="text-sm text-muted-foreground">Instant notification with all lead details</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Demo Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Interactions</span>
              <span className="font-bold">{interactionCount}/3</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min((interactionCount / 3) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {completed ? '✅ Demo completed! +25 XP earned' : 'Complete 3 interactions to earn XP'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}