import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default knowledge base
const defaultKnowledge = {
  services: {
    "performance marketing": "We specialize in Meta Ads, Google Ads, and LinkedIn Ads with AI-optimized targeting. Average 3.5x ROAS for our clients.",
    "ai automation": "Our AI automation includes chatbots, workflow automation, lead nurturing, CRM integration, and email sequences. We've automated 10,000+ hours for clients.",
    "lead generation": "AI-powered lead generation with smart qualification, scoring, and routing. 40% average increase in qualified leads.",
    "email automation": "Personalized email sequences with AI-written copy, A/B testing, and behavioral triggers.",
    "chatbot": "24/7 AI chatbots that qualify leads, book meetings, and provide instant support.",
    "ai playground": "AI Playground is where you can test our demo and have a real feel of the automation workflows we build.",
    "website chatbot": "Custom AI chatbots for websites that engage visitors, answer questions, and capture leads 24/7.",
    "whatsapp automation": "WhatsApp business automation for customer support, lead follow-up, and marketing campaigns.",
    "crm setup": "CRM implementation and automation setup for better lead management and sales tracking."
  },
  pricing: {
    starter: "₹25,000/month - Perfect for small businesses. Includes basic ads management and chatbot.",
    growth: "₹50,000/month - For scaling businesses. Full automation suite with dedicated support.",
    enterprise: "Custom pricing - Enterprise solutions with white-glove service and custom integrations."
  },
  company: {
    name: "HireMediaMind",
    tagline: "AI-Powered Marketing & Automation Agency",
    email: "team@hiremediamind.com",
    whatsapp: "+91 8429889303",
    booking: "https://calendly.com/team-hiremediamind/30min"
  }
};

// Fetch knowledge base from PHP API
async function fetchKnowledgeBase(): Promise<any[]> {
  try {
    const response = await fetch('https://hiremediamind.com/api/chatbot/knowledge.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.log('Knowledge base fetch non-200:', response.status);
      return [];
    }

    const data = await response.json();
    if (data?.success && Array.isArray(data.knowledge)) {
      console.log('Fetched knowledge base:', data.knowledge.length, 'entries');
      return data.knowledge;
    }

    console.log('Knowledge base response missing expected fields');
    return [];
  } catch (error) {
    console.error('Failed to fetch knowledge base:', error);
    return [];
  }
}

async function fetchChatbotConfig(): Promise<any | null> {
  try {
    const response = await fetch('https://hiremediamind.com/api/chatbot/config.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.log('Chatbot config fetch non-200:', response.status);
      return null;
    }

    const data = await response.json();
    if (data?.success && data.config) return data.config;
    return null;
  } catch (error) {
    console.error('Failed to fetch chatbot config:', error);
    return null;
  }
}

// Match user query to knowledge base entries
function matchKnowledge(message: string, knowledgeBase: any[]): string {
  const lowerMessage = message.toLowerCase();
  let matches: { entry: any; score: number }[] = [];
  
  for (const entry of knowledgeBase) {
    const isActive =
      (typeof entry.is_active === 'boolean' ? entry.is_active : null) ??
      (typeof entry.active === 'boolean' ? entry.active : null) ??
      (typeof entry.status === 'string' ? entry.status.toLowerCase() === 'active' : true);

    if (!isActive) continue;

    let score = 0;
    const question = (entry.question || '').toLowerCase();
    const keywords = (entry.keywords || '').toLowerCase().split(',').map((k: string) => k.trim());
    const answer = (entry.answer || '').toLowerCase();
    
    // Direct question match (highest priority)
    if (lowerMessage.includes(question) || question.includes(lowerMessage)) {
      score += 100;
    }
    
    // Keyword matches
    for (const keyword of keywords) {
      if (keyword && lowerMessage.includes(keyword)) {
        score += 30;
      }
    }
    
    // Word-level matching
    const messageWords = lowerMessage.split(/\s+/);
    const questionWords = question.split(/\s+/);
    
    for (const word of messageWords) {
      if (word.length > 3 && questionWords.includes(word)) {
        score += 15;
      }
    }
    
    // Priority boost
    score += (entry.priority || 0) * 5;
    
    if (score > 0) {
      matches.push({ entry, score });
    }
  }
  
  // Sort by score and take top matches
  matches.sort((a, b) => b.score - a.score);
  
  if (matches.length > 0 && matches[0].score >= 25) {
    const topMatches = matches.slice(0, 3);
    return topMatches.map(m => 
      `Q: ${m.entry.question}\nA: ${m.entry.answer}`
    ).join('\n\n');
  }
  
  return '';
}

function buildDefaultContext(message: string): string {
  const lowerMessage = message.toLowerCase();
  let context = "";
  
  // Check for service-related queries
  for (const [service, desc] of Object.entries(defaultKnowledge.services)) {
    const keywords = service.split(' ');
    if (keywords.some(k => lowerMessage.includes(k))) {
      context += `${service}: ${desc}\n`;
    }
  }
  
  // Pricing queries
  if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("pricing") || lowerMessage.includes("package")) {
    context += `\nPricing Information:\n`;
    context += `- Starter: ${defaultKnowledge.pricing.starter}\n`;
    context += `- Growth: ${defaultKnowledge.pricing.growth}\n`;
    context += `- Enterprise: ${defaultKnowledge.pricing.enterprise}\n`;
  }
  
  return context;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const { message, session_id, lead_info, conversation_history } = await req.json();

    console.log('Chat request:', { session_id, message, lead_info });

    const [knowledgeBase, chatbotConfig] = await Promise.all([
      fetchKnowledgeBase(),
      fetchChatbotConfig(),
    ]);

    const knowledgeMatch = matchKnowledge(message, knowledgeBase);
    const defaultContext = buildDefaultContext(message);

    // Combine contexts
    let context = "";
    if (knowledgeMatch) {
      context += "**Relevant Knowledge Base Entries:**\n" + knowledgeMatch + "\n\n";
    }
    if (defaultContext) {
      context += "**Default Information:**\n" + defaultContext;
    }

    const effectiveBookingLink = chatbotConfig?.booking_link || defaultKnowledge.company.booking;

    // Use custom prompt from saved config first
    const basePrompt = (chatbotConfig?.custom_prompt || '').trim() || `You are Maya, the AI assistant for ${defaultKnowledge.company.name} - ${defaultKnowledge.company.tagline}.

Your personality:
- Friendly, professional, and helpful
- Conversational but concise
- Focus on answering the user's question using the Knowledge Base when available

Booking / strategy call rules:
- Only suggest or share the booking link when the user explicitly asks to book/schedule a call/meeting/appointment, OR when the user agrees after you propose it.
- When the user asks to book, first ask for: preferred date, preferred time, and timezone; then provide the booking link.
- Booking link (use exactly this when needed): ${effectiveBookingLink}

Company Info:
- Name: ${defaultKnowledge.company.name}
- Email: ${defaultKnowledge.company.email}
- WhatsApp: ${defaultKnowledge.company.whatsapp}

Guidelines:
1. Keep responses under 120 words unless explaining something complex
2. If asked about pricing, provide the packages and ask 1 follow-up question
3. IMPORTANT: If there's a knowledge base match, use that answer as your primary source
4. Never make up facts - if unsure, say so and ask a clarifying question`;

    const messages = [
      {
        role: "system",
        content: `${basePrompt}

${context ? `\n**Context for this query:**\n${context}` : ''}

${lead_info?.name ? `\nSpeaking with: ${lead_info.name}` : ''}
${lead_info?.email ? `Email: ${lead_info.email}` : ''}
${lead_info?.location ? `Location: ${lead_info.location}` : ''}
${lead_info?.interest ? `Interest: ${lead_info.interest}` : ''}`
      }
    ];

    // Add conversation history
    if (conversation_history && Array.isArray(conversation_history)) {
      conversation_history.forEach((msg: { role: string; content: string }) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current message
    messages.push({ role: "user", content: message });

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const botMessage = data.choices[0]?.message?.content || "I apologize, I'm having trouble responding right now.";

    console.log('Bot response generated, knowledge match found:', !!knowledgeMatch);

    // Determine suggestions based on context
    let suggestions: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
      suggestions = ["Book Strategy Call", "Tell me about services", "Compare packages"];
    } else if (lowerMessage.includes("service") || lowerMessage.includes("help")) {
      suggestions = ["AI Automation", "Performance Marketing", "See pricing"];
    } else if (!lead_info?.name) {
      suggestions = ["Performance Marketing", "AI Automation", "View Pricing"];
    } else {
      suggestions = ["Book a Call", "Learn More", "Get Started"];
    }

    // Show booking only on explicit user intent
    const showBooking = lowerMessage.includes("book") ||
      lowerMessage.includes("schedule") ||
      lowerMessage.includes("appointment") ||
      lowerMessage.includes("meeting") ||
      lowerMessage.includes("call");

    return new Response(JSON.stringify({
      success: true,
      message: botMessage,
      suggestions: suggestions,
      show_booking: showBooking,
      booking_link: effectiveBookingLink,
      session_id: session_id,
      knowledge_matched: !!knowledgeMatch,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: "I'm having trouble connecting right now. Please reach us at team@hiremediamind.com or WhatsApp: +91 8429889303",
      booking_link: "https://calendly.com/team-hiremediamind/30min",
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
