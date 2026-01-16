<?php
/**
 * Seed Knowledge Base with initial data
 * Run this once to populate the chatbot with HireMediaMind knowledge
 */

require_once __DIR__ . '/../config.php';
require_admin_auth();

// Knowledge base entries
$knowledge = [
    // Company Info
    [
        'category' => 'company',
        'question' => 'What is HireMediaMind?',
        'keywords' => 'about, company, who are you, what do you do, hiremediamind',
        'answer' => "**HireMediaMind** is a Performance Marketing & AI Automation Agency that helps service businesses, coaches, and online brands grow with predictable systems.\n\n🎯 **Our Mission:** Help businesses generate qualified leads and automate their growth using cutting-edge marketing and AI technology.\n\n🌍 **We work with:** Local businesses, coaches, agencies, consultants, and e-commerce brands worldwide.",
        'priority' => 100
    ],
    [
        'category' => 'company',
        'question' => 'Where is HireMediaMind located?',
        'keywords' => 'location, where, based, office, country, india',
        'answer' => "We're a digital-first agency working with clients globally. Our team operates primarily from India (IST timezone), but we serve clients across the US, UK, UAE, Australia, and beyond.\n\n🕐 **Business Hours:** 9 AM - 6 PM IST\n📧 **Email:** team@hiremediamind.com",
        'priority' => 50
    ],
    
    // Services - Performance Marketing
    [
        'category' => 'performance_marketing',
        'question' => 'What is Performance Marketing?',
        'keywords' => 'performance marketing, paid ads, advertising, facebook ads, google ads, meta ads, ppc',
        'answer' => "**Performance Marketing** is our data-driven approach to paid advertising that focuses on measurable results.\n\n📊 **What we manage:**\n• Meta Ads (Facebook & Instagram)\n• Google Ads (Search, Display, YouTube)\n• LinkedIn Ads\n• Landing page optimization\n\n📈 **Our approach:**\n1. Deep audience research\n2. Compelling creative development\n3. Continuous A/B testing\n4. ROAS optimization\n\n**Average client sees 3-5x ROAS within 90 days!**",
        'priority' => 90
    ],
    [
        'category' => 'performance_marketing',
        'question' => 'How much does Performance Marketing cost?',
        'keywords' => 'price, pricing, cost, performance marketing package, marketing cost',
        'answer' => "Our **Performance Marketing** packages:\n\n🥉 **Starter** - $997/month\n• Up to $5K ad spend management\n• 2 campaigns\n• Weekly reporting\n• Email support\n\n🥈 **Growth** - $1,997/month\n• Up to $15K ad spend management\n• 4 campaigns\n• Bi-weekly strategy calls\n• Slack support\n\n🥇 **Scale** - $3,997/month\n• Unlimited ad spend management\n• Unlimited campaigns\n• Weekly calls\n• Dedicated account manager\n\n*Note: Ad spend is separate from management fees.*",
        'priority' => 85
    ],
    
    // Services - AI Automation
    [
        'category' => 'ai_automation',
        'question' => 'What is AI Automation?',
        'keywords' => 'ai automation, chatbot, workflow, automate, crm, artificial intelligence',
        'answer' => "**AI Automation** helps businesses save time and scale by automating repetitive tasks with intelligent systems.\n\n🤖 **What we build:**\n• Custom AI chatbots (like me!)\n• Lead nurturing sequences\n• CRM automation & workflows\n• WhatsApp & Email automation\n• Appointment scheduling bots\n\n⏰ **Results:** Most clients save 10-20 hours per week and see ROI within 30 days!",
        'priority' => 90
    ],
    [
        'category' => 'ai_automation',
        'question' => 'How much does AI Automation cost?',
        'keywords' => 'price, pricing, cost, automation package, chatbot cost',
        'answer' => "Our **AI Automation** packages:\n\n🤖 **Starter** - $497 setup + $97/month\n• 1 AI chatbot\n• Basic automation flows\n• Email support\n• Standard response time\n\n⚡ **Pro** - $1,497 setup + $197/month\n• Multiple chatbots\n• Advanced workflow automation\n• CRM integration\n• Priority support\n\n🚀 **Scale** - $2,997 setup + $397/month\n• Custom AI solutions\n• Full system integration\n• White-glove setup\n• Dedicated support",
        'priority' => 85
    ],
    
    // AI Lead Engine
    [
        'category' => 'products',
        'question' => 'What is the AI Lead Engine?',
        'keywords' => 'ai lead engine, lead generation, done for you, product, system',
        'answer' => "The **AI Lead Engine** is our premium done-for-you lead generation system! 🚀\n\n💎 **What's included:**\n• Complete lead generation funnel\n• AI-powered lead qualification\n• Automated follow-up sequences\n• CRM setup & integration\n• 30-day optimization support\n\n💰 **Price:** $497 (one-time payment)\n\nThis is perfect for businesses that want a working lead system without the learning curve. We set it up, you get the leads!",
        'priority' => 95
    ],
    
    // Process
    [
        'category' => 'process',
        'question' => 'How do you work? What is your process?',
        'keywords' => 'process, how it works, steps, onboarding, start',
        'answer' => "Here's how we work together:\n\n**Step 1: Discovery Call** 📞\nWe learn about your business, goals, and challenges.\n\n**Step 2: Strategy & Proposal** 📋\nWe create a custom plan tailored to your needs.\n\n**Step 3: Onboarding** 🚀\nQuick setup process to get everything running.\n\n**Step 4: Launch & Optimize** 📈\nWe launch campaigns and continuously optimize for results.\n\n**Step 5: Growth Partnership** 🤝\nOngoing support to scale your success.\n\nReady to start? Book a free strategy call!",
        'priority' => 80
    ],
    
    // Results
    [
        'category' => 'results',
        'question' => 'What results do your clients get?',
        'keywords' => 'results, case study, testimonial, proof, success, roi',
        'answer' => "Our clients see real, measurable results:\n\n📊 **Performance Marketing:**\n• Average 3-5x ROAS within 90 days\n• 40-60% reduction in cost per lead\n• Consistent lead flow month over month\n\n🤖 **AI Automation:**\n• 10-20 hours saved per week\n• 80%+ response rate on automated messages\n• 3x more leads qualified automatically\n\n💎 **AI Lead Engine:**\n• Clients generate 50-100+ leads/month\n• 24/7 lead capture and qualification\n• Hands-free lead nurturing\n\nWant to see specific case studies? Just ask!",
        'priority' => 75
    ],
    
    // FAQ
    [
        'category' => 'faq',
        'question' => 'Do you offer refunds or guarantees?',
        'keywords' => 'refund, guarantee, money back, risk, trial',
        'answer' => "We're confident in our work, which is why we offer:\n\n✅ **Strategy Call:** 100% free, no obligation\n✅ **Performance Marketing:** Month-to-month, cancel anytime\n✅ **AI Automation:** 30-day satisfaction guarantee\n✅ **AI Lead Engine:** 14-day refund policy\n\nWe don't lock you into long contracts because we believe in earning your business every month.",
        'priority' => 70
    ],
    [
        'category' => 'faq',
        'question' => 'How long does it take to see results?',
        'keywords' => 'timeline, how long, when, results time, duration',
        'answer' => "Here's what to expect:\n\n📊 **Performance Marketing:**\n• Week 1-2: Setup & launch\n• Week 3-4: Data collection & optimization\n• Month 2-3: Scaling winning campaigns\n• **Typical results: 60-90 days**\n\n🤖 **AI Automation:**\n• Week 1: Setup & configuration\n• Week 2: Testing & training\n• **Typical results: 14-30 days**\n\n💎 **AI Lead Engine:**\n• Setup: 3-5 business days\n• **Leads start: Within first week**",
        'priority' => 70
    ],
    [
        'category' => 'faq',
        'question' => 'Who do you work with?',
        'keywords' => 'clients, who, work with, industries, niches, target',
        'answer' => "We work with growth-minded businesses:\n\n🏢 **Local & Service Businesses**\nClinics, salons, home services, legal, accounting\n\n👨‍🏫 **Coaches & Course Creators**\nHigh-ticket programs, group coaching, online courses\n\n🏛️ **Agencies & Consultants**\nMarketing, creative, IT agencies\n\n🛒 **Online & Digital Brands**\nE-commerce, SaaS, info products\n\n**Best fit:** Businesses doing $10K+/month looking to scale with systems.",
        'priority' => 65
    ],
    
    // Contact
    [
        'category' => 'contact',
        'question' => 'How can I contact HireMediaMind?',
        'keywords' => 'contact, email, phone, reach, talk, support',
        'answer' => "We'd love to hear from you!\n\n📧 **Email:** team@hiremediamind.com\n🌐 **Website:** www.hiremediamind.com\n📞 **Book a Call:** Click the booking button below!\n\n🕐 **Response Time:**\n• Chat: Instant (that's me! 🤖)\n• Email: Within 24 hours\n• Calls: Schedule at your convenience\n\nWhat can I help you with today?",
        'priority' => 60
    ]
];

try {
    $stmt = $pdo->prepare("
        INSERT INTO chatbot_knowledge (category, question, keywords, answer, priority, is_active)
        VALUES (?, ?, ?, ?, ?, TRUE)
    ");
    
    $inserted = 0;
    foreach ($knowledge as $item) {
        $stmt->execute([
            $item['category'],
            $item['question'],
            $item['keywords'],
            $item['answer'],
            $item['priority']
        ]);
        $inserted++;
    }
    
    json_response([
        'success' => true,
        'message' => "Successfully seeded $inserted knowledge entries",
        'count' => $inserted
    ]);
} catch (PDOException $e) {
    json_response(['error' => 'Failed to seed knowledge: ' . $e->getMessage()], 500);
}
