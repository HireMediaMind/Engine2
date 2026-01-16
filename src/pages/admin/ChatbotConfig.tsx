import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import AuthGuard from '@/components/admin/AuthGuard';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Bot, Palette, Clock, Link, MessageSquare, Code, Copy, Check } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface ChatbotConfig {
  bot_name: string;
  greeting_message: string;
  primary_color: string;
  secondary_color: string;
  avatar_url: string;
  timezone: string;
  business_hours_start: string;
  business_hours_end: string;
  auto_collect_lead: boolean;
  google_sheet_id: string;
  google_sheet_webhook: string;
  custom_prompt: string;
  fallback_message: string;
  enable_booking: boolean;
  booking_link: string;
}

const defaultConfig: ChatbotConfig = {
  bot_name: 'Maya',
  greeting_message: "Hi! I'm Maya, your AI assistant at HireMediaMind. 👋\n\nI'm here to help you explore our AI automation and marketing services.\n\nBefore we begin, may I know your name?",
  primary_color: '#14b8a6',
  secondary_color: '#0ea5e9',
  avatar_url: '',
  timezone: 'Asia/Kolkata',
  business_hours_start: '09:00',
  business_hours_end: '18:00',
  auto_collect_lead: true,
  google_sheet_id: '',
  google_sheet_webhook: '',
  custom_prompt: '',
  fallback_message: "I appreciate your question! While I don't have the exact answer right now, our team would love to help. Would you like to book a call with us?",
  enable_booking: true,
  booking_link: 'https://calendly.com/team-hiremediamind/30min'
};

export default function ChatbotConfig() {
  const [config, setConfig] = useState<ChatbotConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedEmbed, setCopiedEmbed] = useState<string | null>(null);

  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(() => localStorage.getItem('hmm_ga_id') || '');
  const [facebookPixelId, setFacebookPixelId] = useState(() => localStorage.getItem('hmm_fb_pixel_id') || '');

  const handleCopyEmbed = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedEmbed(type);
    toast.success('Embed code copied to clipboard!');
    setTimeout(() => setCopiedEmbed(null), 2000);
  };

  const chatbotWidgetCode = `<!-- HireMediaMind Chatbot Widget -->
<script>
  window.HIREMEDIAMIND_CONFIG = {
    apiUrl: "https://hiremediamind.com/api",
    botName: "${config.bot_name}",
    primaryColor: "${config.primary_color}",
    secondaryColor: "${config.secondary_color}",
    greetingMessage: "${config.greeting_message.replace(/"/g, '\\"')}",
    enableBooking: ${config.enable_booking},
    bookingLink: "${config.booking_link}"
  };
</script>
<script src="https://hiremediamind.com/chatbot-widget.js" async></script>`;

  const googleAnalyticsCode = `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId || 'YOUR_GA_ID'}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);} 
  gtag('js', new Date());
  gtag('config', '${googleAnalyticsId || 'YOUR_GA_ID'}');
</script>`;

  const facebookPixelCode = `<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${facebookPixelId || 'YOUR_PIXEL_ID'}');
  fbq('track', 'PageView');
</script>`;

  const calendlyCode = `<!-- Calendly inline widget -->
<div class="calendly-inline-widget" data-url="${config.booking_link}" style="min-width:320px;height:700px;"></div>
<script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>`;

  const leadFormCode = `<!-- Lead Capture Form -->
<form action="https://hiremediamind.com/api/submit-lead.php" method="POST">
  <input type="text" name="name" placeholder="Your Name" required />
  <input type="email" name="email" placeholder="Your Email" required />
  <input type="tel" name="phone" placeholder="Phone Number" />
  <input type="hidden" name="source" value="website_embed" />
  <button type="submit">Get Started</button>
</form>`;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/config.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success && data.config) {
        setConfig({ ...defaultConfig, ...data.config });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Failed to load chatbot configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/config.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Configuration saved successfully!');
      } else {
        toast.error(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof ChatbotConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background">
            <AdminSidebar />
            <main className="flex-1 p-8">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            </main>
          </div>
        </SidebarProvider>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Helmet>
        <title>Chatbot Configuration | Admin</title>
      </Helmet>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar />
          <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Chatbot Configuration</h1>
              <p className="text-muted-foreground mt-1">Customize your AI chatbot's behavior and appearance</p>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="general" className="gap-2">
                <Bot className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="behavior" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Behavior
              </TabsTrigger>
              <TabsTrigger value="integrations" className="gap-2">
                <Link className="h-4 w-4" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="embed" className="gap-2">
                <Code className="h-4 w-4" />
                Embed Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Bot Identity</CardTitle>
                    <CardDescription>Configure your chatbot's name and personality</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="bot_name">Bot Name</Label>
                      <Input
                        id="bot_name"
                        value={config.bot_name}
                        onChange={(e) => handleChange('bot_name', e.target.value)}
                        placeholder="MediaMind AI"
                      />
                    </div>
                    <div>
                      <Label htmlFor="avatar_url">Avatar URL (optional)</Label>
                      <Input
                        id="avatar_url"
                        value={config.avatar_url}
                        onChange={(e) => handleChange('avatar_url', e.target.value)}
                        placeholder="https://example.com/avatar.png"
                      />
                    </div>
                    <div>
                      <Label htmlFor="greeting_message">Greeting Message</Label>
                      <Textarea
                        id="greeting_message"
                        value={config.greeting_message}
                        onChange={(e) => handleChange('greeting_message', e.target.value)}
                        placeholder="Hi! How can I help you today?"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Business Hours
                    </CardTitle>
                    <CardDescription>Set your operating timezone and hours</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={config.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                        placeholder="Asia/Kolkata"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="business_hours_start">Start Time</Label>
                        <Input
                          id="business_hours_start"
                          type="time"
                          value={config.business_hours_start}
                          onChange={(e) => handleChange('business_hours_start', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="business_hours_end">End Time</Label>
                        <Input
                          id="business_hours_end"
                          type="time"
                          value={config.business_hours_end}
                          onChange={(e) => handleChange('business_hours_end', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Colors & Styling</CardTitle>
                  <CardDescription>Customize the chatbot's visual appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="primary_color">Primary Color</Label>
                      <div className="flex gap-3 mt-2">
                        <input
                          type="color"
                          id="primary_color"
                          value={config.primary_color}
                          onChange={(e) => handleChange('primary_color', e.target.value)}
                          className="h-10 w-16 cursor-pointer rounded border"
                        />
                        <Input
                          value={config.primary_color}
                          onChange={(e) => handleChange('primary_color', e.target.value)}
                          placeholder="#0ea5e9"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondary_color">Secondary Color</Label>
                      <div className="flex gap-3 mt-2">
                        <input
                          type="color"
                          id="secondary_color"
                          value={config.secondary_color}
                          onChange={(e) => handleChange('secondary_color', e.target.value)}
                          className="h-10 w-16 cursor-pointer rounded border"
                        />
                        <Input
                          value={config.secondary_color}
                          onChange={(e) => handleChange('secondary_color', e.target.value)}
                          placeholder="#10b981"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="mt-6">
                    <Label>Preview</Label>
                    <div className="mt-2 rounded-lg border p-4 bg-muted/30">
                      <div 
                        className="inline-flex items-center gap-3 rounded-lg px-4 py-2 text-white"
                        style={{ backgroundColor: config.primary_color }}
                      >
                        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{config.bot_name}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="behavior">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Lead Collection</CardTitle>
                    <CardDescription>Configure how the chatbot collects lead information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto_collect_lead">Auto Collect Lead Info</Label>
                        <p className="text-sm text-muted-foreground">Automatically ask for name, email, location</p>
                      </div>
                      <Switch
                        id="auto_collect_lead"
                        checked={config.auto_collect_lead}
                        onCheckedChange={(checked) => handleChange('auto_collect_lead', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Booking Integration</CardTitle>
                    <CardDescription>Enable call booking within the chat</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enable_booking">Enable Booking</Label>
                        <p className="text-sm text-muted-foreground">Allow users to book calls directly</p>
                      </div>
                      <Switch
                        id="enable_booking"
                        checked={config.enable_booking}
                        onCheckedChange={(checked) => handleChange('enable_booking', checked)}
                      />
                    </div>
                    {config.enable_booking && (
                      <div>
                        <Label htmlFor="booking_link">Booking Link (Calendly, Cal.com, etc.)</Label>
                        <Input
                          id="booking_link"
                          value={config.booking_link}
                          onChange={(e) => handleChange('booking_link', e.target.value)}
                          placeholder="https://calendly.com/your-link"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Fallback Response</CardTitle>
                    <CardDescription>Message shown when the bot doesn't have a specific answer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={config.fallback_message}
                      onChange={(e) => handleChange('fallback_message', e.target.value)}
                      placeholder="I don't have an answer for that, but our team can help..."
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="integrations">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Google Sheets Integration</CardTitle>
                    <CardDescription>Send lead data to Google Sheets for easy tracking</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="google_sheet_webhook">Google Apps Script Webhook URL</Label>
                      <Input
                        id="google_sheet_webhook"
                        value={config.google_sheet_webhook}
                        onChange={(e) => handleChange('google_sheet_webhook', e.target.value)}
                        placeholder="https://script.google.com/macros/s/..."
                        type="password"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Create a Google Apps Script to receive webhook data. See documentation for setup.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Custom AI Prompt</CardTitle>
                    <CardDescription>Customize how your chatbot behaves and responds</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="custom_prompt">System Prompt</Label>
                      <Textarea
                        id="custom_prompt"
                        value={config.custom_prompt || ''}
                        onChange={(e) => handleChange('custom_prompt', e.target.value)}
                        placeholder="Leave empty for default. Example: You are a helpful assistant for HireMediaMind. Focus on lead generation and always recommend booking a call."
                        rows={5}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Customize how the AI behaves. Leave empty to use the default prompt.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="google_sheet_webhook">Google Sheet Webhook (for chatbot leads)</Label>
                      <Input
                        id="google_sheet_webhook"
                        value={config.google_sheet_webhook || ''}
                        onChange={(e) => handleChange('google_sheet_webhook', e.target.value)}
                        placeholder="https://script.google.com/macros/s/..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Chatbot will send visitor info (name, email, location) to this Google Sheet.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="embed">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Chatbot Widget Embed</CardTitle>
                    <CardDescription>Copy this code to add the chatbot to any website</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-48 font-mono">
                        <code>{chatbotWidgetCode}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopyEmbed(chatbotWidgetCode, 'chatbot')}
                      >
                        {copiedEmbed === 'chatbot' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Paste this code just before the closing &lt;/body&gt; tag on your website.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Calendly / Booking Widget</CardTitle>
                    <CardDescription>Embed your booking calendar directly on your website</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-48 font-mono">
                        <code>{calendlyCode}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopyEmbed(calendlyCode, 'calendly')}
                      >
                        {copiedEmbed === 'calendly' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lead Capture Form</CardTitle>
                    <CardDescription>Simple form to capture leads from external pages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-48 font-mono">
                        <code>{leadFormCode}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopyEmbed(leadFormCode, 'leadform')}
                      >
                        {copiedEmbed === 'leadform' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Google Analytics</CardTitle>
                      <CardDescription>Track website visitors and conversions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="ga_id">Google Analytics ID</Label>
                        <Input
                          id="ga_id"
                          value={googleAnalyticsId}
                          onChange={(e) => {
                            const v = e.target.value;
                            setGoogleAnalyticsId(v);
                            localStorage.setItem('hmm_ga_id', v);
                          }}
                          placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX"
                        />
                      </div>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-40 font-mono text-xs">
                          <code>{googleAnalyticsCode}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopyEmbed(googleAnalyticsCode, 'ga')}
                        >
                          {copiedEmbed === 'ga' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Paste this code in your website header (or Tag Manager). If you leave the ID empty, it will show the placeholder.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Facebook Pixel</CardTitle>
                      <CardDescription>Track conversions from Facebook ads</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="fb_pixel_id">Facebook Pixel ID</Label>
                        <Input
                          id="fb_pixel_id"
                          value={facebookPixelId}
                          onChange={(e) => {
                            const v = e.target.value;
                            setFacebookPixelId(v);
                            localStorage.setItem('hmm_fb_pixel_id', v);
                          }}
                          placeholder="123456789012345"
                        />
                      </div>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-40 font-mono text-xs">
                          <code>{facebookPixelCode}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopyEmbed(facebookPixelCode, 'fb')}
                        >
                          {copiedEmbed === 'fb' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Paste this code in your website header (or Tag Manager). If you leave the ID empty, it will show the placeholder.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
