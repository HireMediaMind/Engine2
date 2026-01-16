import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Loader2, MessageSquare } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const subjects = [
  "Performance Marketing",
  "AI Automation",
  "Pricing Inquiry",
  "Partnership",
  "Other",
];

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as keyof ContactFormData;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit to Database first
      try {
        await fetch('https://hiremediamind.com/api/submit-lead.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            business: "General Inquiry",
            message: formData.message,
            service_type: formData.subject,
            page_source: window.location.pathname,
          }),
        });
      } catch (err) {
        console.error("Failed to save lead to DB:", err);
        // We continue to WhatsApp even if DB save fails
      }

      // 2. Open WhatsApp
      const message = encodeURIComponent(
        `New Contact Form Submission:\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "Not provided"}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`
      );

      window.open(`https://wa.me/918429889303?text=${message}`, "_blank");

      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or message us on WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - HireMediaMind | Get in Touch</title>
        <meta
          name="description"
          content="Contact HireMediaMind for performance marketing and AI automation services. We respond within 24 hours."
        />
        <link rel="canonical" href="https://www.hiremediamind.com/contact" />
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="gradient-hero-bg py-16">
            <div className="mx-auto max-w-6xl px-4">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left - Contact Info */}
                <div>
                  <p className="section-label">Contact</p>
                  <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-4">
                    Let's Talk Growth
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Have a question or want to discuss a project? Fill out the form and we'll get back
                    to you within 24 hours.
                  </p>

                  <div className="space-y-6 mb-8">
                    <a
                      href="mailto:team@hiremediamind.com"
                      className="flex items-center gap-4 text-foreground hover:text-primary transition-colors"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">team@hiremediamind.com</p>
                      </div>
                    </a>
                    <a
                      href="https://wa.me/918429889303"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 text-foreground hover:text-primary transition-colors"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-teal/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-teal" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">WhatsApp</p>
                        <p className="font-medium">+91 84298 89303</p>
                      </div>
                    </a>
                    <div className="flex items-center gap-4 text-foreground">
                      <div className="h-12 w-12 rounded-2xl bg-sky/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-sky" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">Remote — Serving Globally</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                    <p className="text-sm text-foreground">
                      <strong>Prefer a call?</strong> Book a free 30-minute strategy session
                      to discuss your project in detail.
                    </p>
                    <a
                      href="/book-call"
                      className="inline-block mt-3 text-primary font-medium hover:underline"
                    >
                      Book a Call →
                    </a>
                  </div>
                </div>

                {/* Right - Form */}
                <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Input
                        placeholder="Your name *"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl"
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="Business email *"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl"
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="What's this about? *" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                    </div>
                    <div>
                      <Textarea
                        placeholder="Your message *"
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="rounded-xl resize-none"
                      />
                      {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
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
                        "Send Message"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Contact;
