import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

const serviceOptions = [
  { value: "facebook-ads", label: "Facebook Ads" },
  { value: "instagram-ads", label: "Instagram Ads" },
  { value: "youtube-ads", label: "YouTube Ads" },
  { value: "google-ads", label: "Google Ads" },
  { value: "ai-automation", label: "AI Automation" },
  { value: "website-chatbot", label: "Website Chatbot" },
  { value: "whatsapp-automation", label: "WhatsApp Automation" },
  { value: "lead-generation", label: "Lead Generation" },
  { value: "crm-setup", label: "CRM Setup" },
  { value: "custom-ai-automation", label: "Custom AI Automation" },
  { value: "other", label: "Other" },
];

// Target countries with cities
const countryData: Record<string, { name: string; cities: string[] }> = {
  US: {
    name: "United States",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "San Francisco", "Miami", "Seattle", "Boston", "Denver", "Dallas", "Atlanta", "San Diego", "Austin", "Las Vegas"]
  },
  UK: {
    name: "United Kingdom",
    cities: ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Glasgow", "Edinburgh", "Bristol", "Sheffield", "Newcastle", "Cardiff", "Belfast", "Nottingham", "Leicester"]
  },
  UAE: {
    name: "United Arab Emirates",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Al Ain"]
  },
  CA: {
    name: "Canada",
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Winnipeg", "Quebec City", "Hamilton", "Victoria"]
  },
  AU: {
    name: "Australia",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Hobart", "Darwin"]
  },
  NZ: {
    name: "New Zealand",
    cities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Dunedin", "Napier", "Queenstown"]
  },
  IE: {
    name: "Ireland",
    cities: ["Dublin", "Cork", "Galway", "Limerick", "Waterford", "Kilkenny", "Drogheda"]
  },
  SG: {
    name: "Singapore",
    cities: ["Singapore City", "Jurong", "Tampines", "Woodlands", "Bedok", "Ang Mo Kio"]
  },
  CH: {
    name: "Switzerland",
    cities: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Lucerne", "St. Gallen"]
  },
  DK: {
    name: "Denmark",
    cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers"]
  },
  DE: {
    name: "Germany",
    cities: ["Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne", "Düsseldorf", "Stuttgart", "Leipzig"]
  },
  LK: {
    name: "Sri Lanka",
    cities: ["Colombo", "Kandy", "Galle", "Negombo", "Jaffna", "Trincomalee"]
  },
  MX: {
    name: "Mexico",
    cities: ["Mexico City", "Guadalajara", "Monterrey", "Cancun", "Tijuana", "Puebla", "León"]
  },
  SD: {
    name: "Sudan",
    cities: ["Khartoum", "Omdurman", "Port Sudan", "Kassala", "Nyala"]
  },
  IN: {
    name: "India",
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Noida", "Gurgaon"]
  },
  GL: {
    name: "Greenland",
    cities: ["Nuuk", "Ilulissat", "Sisimiut", "Qaqortoq"]
  },
  OTHER: {
    name: "Other Country",
    cities: ["Other City"]
  }
};

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  phone: z.string().max(20).optional(),
  service: z.string().min(1, "Please select a service"),
  country: z.string().min(1, "Please select your country"),
  city: z.string().min(1, "Please select your city"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      service: "",
      country: "",
      city: "",
    }
  });

  const selectedService = watch("service");
  const selectedCountry = watch("country");
  const selectedCity = watch("city");

  // Get cities based on selected country
  const availableCities = useMemo(() => {
    if (!selectedCountry || !countryData[selectedCountry]) {
      return [];
    }
    return countryData[selectedCountry].cities;
  }, [selectedCountry]);

  // Reset city when country changes
  const handleCountryChange = (value: string) => {
    setValue("country", value);
    setValue("city", "");
  };

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    const serviceLabel = serviceOptions.find(s => s.value === data.service)?.label || data.service;
    const countryName = countryData[data.country]?.name || data.country;
    
    try {
      // Submit to PHP API on production server
      const response = await fetch(API_ENDPOINTS.submitLead, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          country: countryName,
          city: data.city,
          message: data.message,
          service_type: serviceLabel,
          page_source: window.location.pathname,
        }),
      });

      if (response.ok) {
        toast({
          title: "Message sent successfully!",
          description: "We'll get back to you within 24 hours.",
        });
        reset();
      } else {
        throw new Error('API error');
      }
    } catch (error) {
      // Fallback to WhatsApp if API fails
      const message = `Hi, I'm ${data.name}.

Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ""}
Country: ${countryName}
City: ${data.city}
Service: ${serviceLabel}

Message: ${data.message}`;
      
      const whatsappUrl = `https://wa.me/918429889303?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      
      toast({
        title: "Message prepared!",
        description: "WhatsApp is opening with your message. Just hit send!",
      });
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="border-t border-border gradient-hero-bg">
      <div className="mx-auto max-w-4xl px-4 py-14">
        <div className="mb-8 text-center">
          <p className="section-label">Get In Touch</p>
          <h2 className="section-title">Ready to Scale Your Business?</h2>
          <p className="section-subtitle mx-auto mb-6">
            Fill out the form below and we'll get back to you within 24 hours.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 shadow-lg"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Name *
              </label>
              <Input
                {...register("name")}
                placeholder="Your name"
                className="rounded-full"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Email *
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="you@company.com"
                className="rounded-full"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Phone
              </label>
              <Input
                {...register("phone")}
                type="tel"
                placeholder="+1 234 567 8900"
                className="rounded-full"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Service *
              </label>
              <Select
                value={selectedService}
                onValueChange={(value) => setValue("service", value)}
              >
                <SelectTrigger className="rounded-full bg-background">
                  <SelectValue placeholder="Select a service you're interested in" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  {serviceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.service && (
                <p className="mt-1 text-xs text-destructive">{errors.service.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Country *
                </label>
                <Select
                  value={selectedCountry}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger className="rounded-full bg-background">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50 max-h-[300px]">
                    {Object.entries(countryData).map(([code, { name }]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="mt-1 text-xs text-destructive">{errors.country.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  City *
                </label>
                <Select
                  value={selectedCity}
                  onValueChange={(value) => setValue("city", value)}
                  disabled={!selectedCountry}
                >
                  <SelectTrigger className="rounded-full bg-background">
                    <SelectValue placeholder={selectedCountry ? "Select city" : "Select country first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50 max-h-[300px]">
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && (
                  <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Message *
              </label>
              <Textarea
                {...register("message")}
                placeholder="Tell us about your project and goals..."
                rows={4}
                className="rounded-2xl"
              />
              {errors.message && (
                <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
