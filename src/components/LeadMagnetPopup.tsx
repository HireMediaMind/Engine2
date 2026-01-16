import { useState, useEffect } from "react";
import { X, Gift, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/lib/api";

const businessTypes = [
  "Coach / Consultant",
  "Agency / Marketing",
  "E-commerce / D2C",
  "SaaS / Tech",
  "Real Estate",
  "Health & Wellness",
  "Education / Courses",
  "Other",
];

export function LeadMagnetPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessType: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const hasSubmittedForm = localStorage.getItem("hmm_lead_magnet_submitted");
    if (hasSubmittedForm) {
      setHasSubmitted(true);
      return;
    }

    const markSeen = () => localStorage.setItem("hmm_lead_magnet_seen", "true");
    const hasSeenNow = () => Boolean(localStorage.getItem("hmm_lead_magnet_seen"));

    let timer: number | undefined;

    const openOnce = () => {
      if (hasSeenNow()) return;
      setIsOpen(true);
      markSeen(); // mark immediately so it never opens again
      if (timer) window.clearTimeout(timer);
    };

    // Show popup after 12 seconds (slightly faster)
    timer = window.setTimeout(openOnce, 12000);

    // ...or on scroll past 50%
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50) {
        openOnce();
      }
    };

    // ...or Exit Intent (Mouse moves to top of screen)
    const handleExitIntent = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        openOnce();
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mouseleave", handleExitIntent);

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleExitIntent);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hmm_lead_magnet_seen", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.businessType) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to PHP API on production server
      const response = await fetch(API_ENDPOINTS.submitLead, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          business: formData.businessType,
          message: 'Lead Magnet Download: 7-Day Performance & Automation Plan',
          service_type: 'Lead Magnet',
          page_source: window.location.pathname,
        }),
      });

      // Mark as submitted regardless of API response
      localStorage.setItem("hmm_lead_magnet_submitted", "true");
      setHasSubmitted(true);
      setIsOpen(false);

      if (response.ok) {
        toast({
          title: "Success! Check your email",
          description: "Your 7-Day Plan is on its way. Also check spam folder.",
        });
      } else {
        // Fallback notification via WhatsApp
        const message = encodeURIComponent(
          `New Lead Magnet Download:\n\nName: ${formData.name}\nEmail: ${formData.email}\nBusiness Type: ${formData.businessType}\n\nRequested: 7-Day Performance & Automation Plan`
        );
        window.open(`https://wa.me/918429889303?text=${message}`, "_blank");
        toast({
          title: "Success! Check your email",
          description: "Your 7-Day Plan is on its way. Also check spam folder.",
        });
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || hasSubmitted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-scale-in rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Gift className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Free: 7-Day Growth Plan
          </h2>
          <p className="text-muted-foreground text-sm">
            Get our step-by-step Performance Marketing + AI Automation plan
            to start generating leads in 7 days.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div>
            <Select
              value={formData.businessType}
              onValueChange={(value) => setFormData({ ...formData, businessType: value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Get My Free Plan"
            )}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          No spam. Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </div>
  );
}
