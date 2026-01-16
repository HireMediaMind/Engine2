import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2, Calendar, User, Mail, MapPin, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { formatAndSanitizeMessage } from '@/lib/sanitize';
import { API_BASE_URL } from '@/lib/api';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
  suggestions?: string[];
  showBooking?: boolean;
  bookingLink?: string;
  collectInfo?: 'name' | 'email' | 'location' | 'interest' | null;
  dealConfirmed?: boolean;
}

interface ChatbotConfig {
  bot_name: string;
  greeting_message: string;
  primary_color: string;
  secondary_color: string;
  avatar_url: string;
  enable_booking: boolean;
  booking_link: string;
  auto_collect_lead: boolean;
  google_sheet_webhook: string;
}

interface LeadInfo {
  name: string;
  email: string;
  location: string;
  interest: string;
}

const defaultConfig: ChatbotConfig = {
  bot_name: 'Maya',
  greeting_message: "Hi! I'm Maya, your AI assistant at HireMediaMind. 👋\n\nI'm here to help you explore our AI automation and marketing services.\n\nBefore we begin, may I know your name?",
  primary_color: '#14b8a6',
  secondary_color: '#0ea5e9',
  avatar_url: '',
  enable_booking: true,
  booking_link: 'https://calendly.com/team-hiremediamind/30min',
  auto_collect_lead: true,
  google_sheet_webhook: ''
};

// Check if chatbot is enabled via embed manager
function isChatbotEnabled(): boolean {
  const embeds = localStorage.getItem('embed_manager_items');
  if (!embeds) return true; // Default to enabled if no embed manager config

  try {
    const items = JSON.parse(embeds);
    // Check if there's any active chatbot or ai-agent embed that should replace the default
    const activeCustomBot = items.find((e: any) =>
      e.isActive &&
      (e.category === 'chat' || e.category === 'ai-agent') &&
      e.embedCode.trim().length > 0
    );

    // If there's an active custom chatbot, disable the default one
    if (activeCustomBot) {
      // Check if it should show on current page
      const currentPath = window.location.pathname;
      const showOnPages = activeCustomBot.showOnPages || ['all'];

      if (showOnPages.includes('all') || showOnPages.includes(currentPath)) {
        return false; // Disable default chatbot, custom one will be injected
      }
    }

    return true;
  } catch {
    return true;
  }
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [config, setConfig] = useState<ChatbotConfig>(defaultConfig);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [leadInfo, setLeadInfo] = useState<LeadInfo>({ name: '', email: '', location: '', interest: '' });
  const [showPulse, setShowPulse] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if chatbot should be enabled
  useEffect(() => {
    setIsEnabled(isChatbotEnabled());
  }, []);

  // Fetch chatbot config from API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chatbot/config.php`);
        const data = await response.json();
        if (data.success && data.config) {
          setConfig(prev => ({
            ...prev,
            bot_name: data.config.bot_name || prev.bot_name,
            greeting_message: data.config.greeting_message || prev.greeting_message,
            primary_color: data.config.primary_color || prev.primary_color,
            secondary_color: data.config.secondary_color || prev.secondary_color,
            avatar_url: data.config.avatar_url || prev.avatar_url,
            enable_booking: data.config.enable_booking ?? prev.enable_booking,
            booking_link: data.config.booking_link || 'https://calendly.com/team-hiremediamind/30min',
            auto_collect_lead: data.config.auto_collect_lead ?? prev.auto_collect_lead,
            google_sheet_webhook: data.config.google_sheet_webhook || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching chatbot config:', error);
      }
    };

    fetchConfig();
  }, []);

  // Initialize session
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatbot_session_id');
    const storedLeadInfo = localStorage.getItem('chatbot_lead_info');

    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatbot_session_id', newSessionId);
      setSessionId(newSessionId);
    }

    if (storedLeadInfo) {
      setLeadInfo(JSON.parse(storedLeadInfo));
    }
  }, []);

  // Show greeting when opened
  useEffect(() => {
    if (isOpen && !hasGreeted && config.greeting_message) {
      setMessages([{
        role: 'bot',
        content: config.greeting_message,
        timestamp: new Date().toISOString(),
        collectInfo: config.auto_collect_lead ? 'name' : null,
        suggestions: ['Performance Marketing', 'AI Automation', 'View Pricing']
      }]);
      setHasGreeted(true);
      setShowPulse(false);
    }
  }, [isOpen, hasGreeted, config.greeting_message, config.auto_collect_lead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Save lead info to localStorage and optionally to Google Sheet
  useEffect(() => {
    if (leadInfo.name || leadInfo.email) {
      localStorage.setItem('chatbot_lead_info', JSON.stringify(leadInfo));

      // Send to Google Sheet if webhook is configured and we have enough info
      if (config.google_sheet_webhook && leadInfo.name && leadInfo.email) {
        sendLeadToGoogleSheet(leadInfo);
      }
    }
  }, [leadInfo, config.google_sheet_webhook]);

  // Send lead info to Google Sheet
  const sendLeadToGoogleSheet = async (info: LeadInfo) => {
    if (!config.google_sheet_webhook) return;

    try {
      await fetch(config.google_sheet_webhook, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: info.name,
          email: info.email,
          location: info.location,
          service_interest: info.interest || 'Chatbot Lead',
          business_type: '',
          pain_points: '',
          lead_score: 0,
          timestamp: new Date().toISOString(),
          session_id: sessionId,
        })
      });
      console.log('Lead sent to Google Sheet');
    } catch (error) {
      console.error('Failed to send lead to Google Sheet:', error);
    }
  };

  // Collect lead info from messages
  const processLeadInfo = useCallback((message: string, lastMessage?: Message) => {
    const newLeadInfo = { ...leadInfo };

    if (lastMessage?.collectInfo === 'name' && !leadInfo.name) {
      newLeadInfo.name = message;
    } else if (lastMessage?.collectInfo === 'email' && !leadInfo.email) {
      if (message.includes('@')) {
        newLeadInfo.email = message;
      }
    } else if (lastMessage?.collectInfo === 'location' && !leadInfo.location) {
      newLeadInfo.location = message;
    }

    setLeadInfo(newLeadInfo);
    return newLeadInfo;
  }, [leadInfo]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    const lastMessage = messages[messages.length - 1];
    const updatedLeadInfo = processLeadInfo(message, lastMessage);

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          session_id: sessionId,
          message: message,
          lead_info: updatedLeadInfo,
          conversation_history: conversationHistory
        }
      });

      if (error) {
        console.error('Chat error:', error);
        throw error;
      }

      if (data?.success) {
        // Determine what info to collect next
        let collectInfo: 'name' | 'email' | 'location' | 'interest' | null = null;
        if (config.auto_collect_lead) {
          if (!updatedLeadInfo.name) {
            collectInfo = 'name';
          } else if (!updatedLeadInfo.email && messages.length > 2) {
            collectInfo = 'email';
          } else if (!updatedLeadInfo.location && messages.length > 4 && updatedLeadInfo.email) {
            collectInfo = 'location';
          }
        }

        const botMessage: Message = {
          role: 'bot',
          content: data.message,
          timestamp: new Date().toISOString(),
          suggestions: data.suggestions,
          showBooking: data.show_booking,
          bookingLink: data.booking_link || config.booking_link,
          collectInfo: collectInfo
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data?.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: "I'm having trouble connecting right now. Please try again or reach us at team@hiremediamind.com or WhatsApp: +91 8429889303",
        timestamp: new Date().toISOString(),
        suggestions: ['Try Again', 'Book a Call'],
        showBooking: true,
        bookingLink: config.booking_link
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading, messages, config.booking_link, config.auto_collect_lead, processLeadInfo]);

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const formatMessage = (content: string) => {
    return formatAndSanitizeMessage(content);
  };

  const getInputPlaceholder = (lastMessage?: Message) => {
    if (!lastMessage) return "Type your message...";

    switch (lastMessage.collectInfo) {
      case 'name': return "Enter your name...";
      case 'email': return "Enter your email...";
      case 'location': return "Enter your location (city/country)...";
      case 'interest': return "What service interests you?";
      default: return "Type your message...";
    }
  };

  const getInputIcon = (lastMessage?: Message) => {
    switch (lastMessage?.collectInfo) {
      case 'name': return <User className="h-4 w-4 text-muted-foreground" />;
      case 'email': return <Mail className="h-4 w-4 text-muted-foreground" />;
      case 'location': return <MapPin className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  // Don't render if disabled
  if (!isEnabled) return null;

  const lastMessage = messages[messages.length - 1];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group glass-effect"
        style={{
          background: `linear-gradient(135deg, ${config.primary_color}, ${config.secondary_color})`
        }}
        aria-label="Open chat"
      >
        <MessageCircle className="h-7 w-7 text-white transition-transform group-hover:scale-110" />
        {showPulse && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ backgroundColor: config.primary_color }}
            />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground shadow-lg animate-bounce">
              1
            </span>
          </>
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col overflow-hidden rounded-2xl bg-card shadow-2xl transition-all duration-300 border border-border/50 glass-morphism",
        isMinimized ? "h-16 w-72 sm:w-80" : "h-[70vh] max-h-[600px] w-[calc(100vw-2rem)] sm:h-[580px] sm:w-[400px]"
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${config.primary_color}, ${config.secondary_color})`
        }}
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-20 h-20 bg-white/20 rounded-full blur-xl animate-float" />
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl animate-float-slow" />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            {config.avatar_url ? (
              <img src={config.avatar_url} alt={config.bot_name} className="h-9 w-9 rounded-full" />
            ) : (
              <Sparkles className="h-5 w-5 text-white animate-sparkle" />
            )}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              {config.bot_name}
              <span className="text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">AI</span>
            </h3>
            <p className="text-xs text-white/80">
              {isLoading ? '✍️ Typing...' : '🟢 Online now'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 relative z-10">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Lead Info Bar */}
          {(leadInfo.name || leadInfo.email) && (
            <div className="px-4 py-2 bg-muted/50 border-b border-border flex items-center gap-3 text-xs backdrop-blur-sm">
              {leadInfo.name && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <User className="h-3 w-3" /> {leadInfo.name}
                </span>
              )}
              {leadInfo.email && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Mail className="h-3 w-3" /> {leadInfo.email}
                </span>
              )}
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex animate-fade-in-up",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all hover:shadow-md",
                      message.role === 'user'
                        ? 'rounded-br-md text-white'
                        : 'bg-muted text-foreground rounded-bl-md glass-effect'
                    )}
                    style={message.role === 'user' ? {
                      background: `linear-gradient(135deg, ${config.primary_color}, ${config.secondary_color})`
                    } : undefined}
                  >
                    <div
                      className="leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />

                    {/* Deal Confirmed Badge */}
                    {message.dealConfirmed && (
                      <div className="mt-3 flex items-center gap-2 bg-emerald-500/20 text-emerald-700 px-3 py-2 rounded-lg animate-fade-in">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Deal Confirmed! 🎉</span>
                      </div>
                    )}

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, sIndex) => (
                          <button
                            key={sIndex}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="rounded-full bg-background px-3 py-1.5 text-xs font-medium text-foreground border border-border transition-all hover:border-primary hover:bg-primary/5 hover:scale-105"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Booking button */}
                    {message.showBooking && message.bookingLink && (
                      <a
                        href={message.bookingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition-all hover:scale-[1.02] shadow-lg animate-pulse-glow"
                        style={{
                          background: `linear-gradient(135deg, ${config.secondary_color}, ${config.primary_color})`
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                        Book Strategy Call
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3 glass-effect">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-3 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                {getInputIcon(lastMessage) && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {getInputIcon(lastMessage)}
                  </div>
                )}
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={getInputPlaceholder(lastMessage)}
                  className={cn(
                    "rounded-full border-muted-foreground/20 pr-4 focus-visible:ring-primary transition-all",
                    getInputIcon(lastMessage) ? "pl-10" : "pl-4"
                  )}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={() => sendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="rounded-full h-10 w-10 transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${config.primary_color}, ${config.secondary_color})`
                }}
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 text-center text-[10px] text-muted-foreground border-t border-border/50">
            Powered by <span className="font-medium text-primary">HireMediaMind AI</span>
          </div>
        </>
      )}
    </div>
  );
}
