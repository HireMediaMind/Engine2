import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal, StaggeredReveal } from "@/components/ui/ScrollReveal";

const faqs = [
  {
    question: "What results can I expect?",
    answer: "Typically, clients see 2-4x ROAS improvement within 60-90 days, with 80% less manual work through automation.",
  },
  {
    question: "Do you work with my industry?",
    answer: "We work with service businesses, coaches, consultants, e-commerce, and SaaS companies worldwide.",
  },
  {
    question: "What's included in your service?",
    answer: "Full ad management (Meta & Google), AI automation setup, landing pages, tracking, and ongoing optimization.",
  },
  {
    question: "How much does it cost?",
    answer: "Our packages start from $500/month for starter plans up to custom enterprise solutions. Book a call to discuss your specific needs.",
  },
  {
    question: "How long until I see results?",
    answer: "Most clients start seeing initial results within the first 2-4 weeks. Significant improvements typically occur within 60-90 days.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-t border-border bg-card">
      <div className="mx-auto max-w-4xl px-4 py-14">
        <ScrollReveal className="mb-12 text-center">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle mx-auto">
            Quick answers to common questions about our services.
          </p>
        </ScrollReveal>
        <StaggeredReveal staggerDelay={80} className="space-y-4">
          {faqs.map((faq, index) => (
            <Accordion key={index} type="single" collapsible>
              <AccordionItem
                value={`item-${index}`}
                className="card-sky rounded-2xl border border-border px-5 card-hover-elevate border-glow-hover"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </StaggeredReveal>
      </div>
    </section>
  );
}
