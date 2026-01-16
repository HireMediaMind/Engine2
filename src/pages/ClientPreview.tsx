import { useParams, useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { formatAndSanitizeMessage } from "@/lib/sanitize";
import { API_ENDPOINTS } from "@/lib/api";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  Shield,
  Workflow,
  Bot,
  Send,
  AlertCircle,
  Lock,
  Eye
} from "lucide-react";

const ClientPreview = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  // State for preview data
  const [preview, setPreview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewAttempts, setViewAttempts] = useState(0);

  // Fetch preview data from PHP API
  const fetchPreview = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.clientPreview}?token=${token}`);
      if (!response.ok) throw new Error("Preview not found");
      const data = await response.json();
      setPreview(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load preview");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [token]);

  // Rate limiting for view attempts
  useEffect(() => {
    const attempts = sessionStorage.getItem(`preview_attempts_${token}`);
    if (attempts) {
      const parsed = JSON.parse(attempts);
      const now = Date.now();
      // Reset after 1 hour
      if (now - parsed.timestamp > 3600000) {
        sessionStorage.setItem(`preview_attempts_${token}`, JSON.stringify({ count: 1, timestamp: now }));
        setViewAttempts(1);
      } else if (parsed.count >= 10) {
        // Block after 10 failed attempts
        setViewAttempts(parsed.count);
      } else {
        setViewAttempts(parsed.count);
      }
    } else {
      sessionStorage.setItem(`preview_attempts_${token}`, JSON.stringify({ count: 1, timestamp: Date.now() }));
      setViewAttempts(1);
    }
  }, [token]);

  // Track failed attempts
  useEffect(() => {
    if (error) {
      const attempts = sessionStorage.getItem(`preview_attempts_${token}`);
      if (attempts) {
        const parsed = JSON.parse(attempts);
        sessionStorage.setItem(`preview_attempts_${token}`, JSON.stringify({
          count: parsed.count + 1,
          timestamp: parsed.timestamp
        }));
        setViewAttempts(parsed.count + 1);
      }
    }
  }, [error, token]);

  // Block excessive attempts
  if (viewAttempts >= 10) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" />
              Access Temporarily Blocked
            </CardTitle>
            <CardDescription>
              Too many access attempts. Please try again later or contact support.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Preview Not Found
            </CardTitle>
            <CardDescription>
              This preview link may have expired or is invalid. Please contact HireMediaMind for a new link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please email <a href="mailto:team@hiremediamind.com" className="text-primary underline">team@hiremediamind.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if expired
  const isExpired = preview.expires_at && new Date(preview.expires_at) < new Date();

  if (isExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <Clock className="h-5 w-5" />
              Preview Expired
            </CardTitle>
            <CardDescription>
              This preview link expired on {new Date(preview.expires_at!).toLocaleDateString()}. Please contact HireMediaMind for a new preview link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.location.href = 'mailto:team@hiremediamind.com?subject=New Preview Link Request'}>
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.clientPreview, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action: 'approve',
          feedback: feedback || null
        })
      });

      if (!response.ok) throw new Error("Approval failed");

      toast.success("Automation approved! We'll begin production deployment.");
      fetchPreview(); // Refresh data
    } catch (err) {
      toast.error("Failed to submit approval. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!feedback.trim()) {
      toast.error("Please provide feedback describing the changes needed");
      return;
    }

    // Basic input validation
    if (feedback.length > 2000) {
      toast.error("Feedback is too long. Please keep it under 2000 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.clientPreview, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action: 'request_changes',
          feedback
        })
      });

      if (!response.ok) throw new Error("Feedback submission failed");

      toast.success("Feedback submitted! We'll review and update the automation.");
      fetchPreview(); // Refresh data
    } catch (err) {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    // Input length limit
    if (chatInput.length > 500) {
      toast.error("Message too long. Please keep it under 500 characters.");
      return;
    }

    const userMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);

    // Simulate AI response based on config
    const config = preview.chatbot_config;

    // REAL AI AGENT: If configured with n8n webhook
    if (config?.use_custom_agent) {
      // Show typing indicator or just wait
      setChatMessages(prev => [...prev, { role: "assistant", content: "..." }]); // Placeholder for loading

      fetch(API_ENDPOINTS.chatProxy, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          message: chatInput,
          history: chatMessages // Optional: Pass history
        })
      })
        .then(res => res.json())
        .then(data => {
          // Remove loading placeholder and add real response
          setChatMessages(prev => {
            const filtered = prev.filter(m => m.content !== "...");
            if (data.error) {
              return [...filtered, { role: "assistant", content: "⚠️ Error connecting to AI agent." }];
            }
            return [...filtered, { role: "assistant", content: data.content || "I received your message." }];
          });
        })
        .catch(err => {
          console.error("Chat Error:", err);
          setChatMessages(prev => {
            const filtered = prev.filter(m => m.content !== "...");
            return [...filtered, { role: "assistant", content: "⚠️ Connection error. Please try again." }];
          });
        });
    }
    // MOCK RESPONSE: For demos without n8n
    else {
      setTimeout(() => {
        const botResponse = {
          role: "assistant",
          content: config?.greeting || "Hello! This is a demo response. In production, I'll be connected to your actual business data and workflows."
        };
        setChatMessages(prev => [...prev, botResponse]);
      }, 1000);
    }

    setChatInput("");
  };

  const capabilities = preview.chatbot_config?.capabilities || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">HireMediaMind</h1>
                <p className="text-sm text-muted-foreground">Secure Client Preview</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Eye className="h-3 w-3" />
                {preview.viewed_at ? 'Viewed' : 'First View'}
              </Badge>
              <Badge variant={preview.status === "approved" ? "default" : "secondary"}>
                {preview.status === "pending" && "Pending Review"}
                {preview.status === "approved" && "Approved"}
                {preview.status === "changes_requested" && "Changes Requested"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Preview Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{preview.title}</CardTitle>
                <CardDescription className="mt-2">{preview.description}</CardDescription>
              </div>
              <Badge variant="outline" className="capitalize">
                {preview.preview_type}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>Prepared for: <strong className="text-foreground">{preview.client_name}</strong></span>
              {preview.expires_at && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Valid until: {new Date(preview.expires_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Security Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">Secure Preview Environment</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This is an isolated preview using anonymized test data. No live credentials or customer data is used.
                  Production systems are connected only after your explicit approval.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="text-xs">End-to-end encrypted</Badge>
                  <Badge variant="secondary" className="text-xs">Isolated environment</Badge>
                  <Badge variant="secondary" className="text-xs">Audit logged</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chatbot Demo */}
          {preview.preview_type === "chatbot" && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI Chatbot Preview
                </CardTitle>
                <CardDescription>
                  Try your custom AI assistant. This demo uses sample data only.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Chat Window */}
                <div className="border rounded-lg h-80 flex flex-col bg-muted/20">
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        Start a conversation to test the chatbot
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg max-w-[80%] ${msg.role === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-card border"
                          }`}
                        dangerouslySetInnerHTML={{ __html: formatAndSanitizeMessage(msg.content) }}
                      />
                    ))}
                  </div>
                  <div className="border-t p-3 flex gap-2 bg-card">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
                      placeholder="Type a message..."
                      maxLength={500}
                      className="flex-1 px-3 py-2 border rounded-md text-sm bg-background"
                    />
                    <Button size="sm" onClick={handleChatSend}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Capabilities */}
                {capabilities.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Planned Capabilities:</p>
                    <div className="flex flex-wrap gap-2">
                      {capabilities.map((cap: string, i: number) => (
                        <Badge key={i} variant="secondary">{cap}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Workflow Preview */}
          <Card className={preview.preview_type === "chatbot" ? "" : "lg:col-span-2"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-primary" />
                Automation Workflow
              </CardTitle>
              <CardDescription>
                Visual representation of your automation logic (read-only preview)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-muted/30 min-h-[200px]">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs mt-2 font-medium">User Input</span>
                  </div>
                  <div className="h-0.5 w-8 bg-gradient-to-r from-primary/50 to-primary" />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs mt-2 font-medium">AI Processing</span>
                  </div>
                  <div className="h-0.5 w-8 bg-gradient-to-r from-primary to-primary/50" />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs mt-2 font-medium">Response</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback & Approval */}
        {preview.status === "pending" && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Approval</CardTitle>
              <CardDescription>
                Review the preview above. Once satisfied, approve for production deployment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Provide feedback or request changes (optional for approval, required for change requests)..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">{feedback.length}/2000 characters</p>
              <div className="flex gap-3">
                <Button onClick={handleApprove} disabled={isSubmitting} className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approve for Production
                </Button>
                <Button variant="outline" onClick={handleRequestChanges} disabled={isSubmitting}>
                  Request Changes
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" />
                No automation is moved to production without explicit client confirmation.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Changes Requested */}
        {preview.status === "changes_requested" && (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Changes Requested</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your feedback has been submitted. Our team is working on the updates.
                    You'll receive a new preview link once changes are ready.
                  </p>
                  {preview.feedback && (
                    <div className="mt-3 p-3 rounded-lg bg-background border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Your feedback:</p>
                      <p className="text-sm">{preview.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Already Approved */}
        {preview.status === "approved" && (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Automation Approved</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Approved on {new Date(preview.approved_at!).toLocaleDateString()} at {new Date(preview.approved_at!).toLocaleTimeString()}.
                    Production deployment is in progress. You'll receive confirmation once live.
                  </p>
                  {preview.feedback && (
                    <div className="mt-3 p-3 rounded-lg bg-background border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Your notes:</p>
                      <p className="text-sm">{preview.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            All client automations are isolated and managed with enterprise-grade security.
          </p>
          <p className="mt-2">
            Questions? Email <a href="mailto:team@hiremediamind.com" className="text-primary underline">team@hiremediamind.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ClientPreview;
