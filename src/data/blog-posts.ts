export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    readTime: string;
    date: string;
    author: string;
    coverImage?: string;
}

export const blogPosts: BlogPost[] = [
    {
        slug: "ai-sales-rep",
        title: "How to Replace Your Sales Rep with AI (And Why You Should)",
        excerpt: "Discover how AI automations can handle lead qualification, follow-ups, and appointment setting 24/7 without a salary.",
        category: "AI Automation",
        readTime: "6 min read",
        date: "Jan 2026",
        author: "HireMediaMind Team",
        coverImage: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200",
    },
    {
        slug: "whatsapp-automation-closing-leads",
        title: "WhatsApp Automation: How to Close More Leads on Autopilot",
        excerpt: "Learn how businesses are using WhatsApp Business API and automation to respond instantly and convert 3x more leads.",
        category: "AI Automation",
        readTime: "5 min read",
        date: "Jan 2026",
        author: "HireMediaMind Team",
        coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200",
    },
    {
        slug: "meta-ads-vs-google-ads",
        title: "Meta Ads vs Google Ads: Which is Better for Your Business in 2026?",
        excerpt: "A detailed comparison of Facebook/Instagram Ads and Google Ads. When to use each platform and how to maximize ROI.",
        category: "Performance Marketing",
        readTime: "7 min read",
        date: "Jan 2026",
        author: "HireMediaMind Team",
        coverImage: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200",
    },
];
