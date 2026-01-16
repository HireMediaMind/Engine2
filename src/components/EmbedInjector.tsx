import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface EmbedItem {
  id: string;
  name: string;
  description: string;
  category: 'ai-agent' | 'analytics' | 'calendar' | 'chat' | 'form' | 'custom';
  embedCode: string;
  isActive: boolean;
  showOnPages: string[];
  createdAt: string;
  order: number;
}

export function EmbedInjector() {
  const location = useLocation();
  const [injectedScripts, setInjectedScripts] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load embeds from localStorage
    const stored = localStorage.getItem('embed_manager_items');
    if (!stored) return;

    try {
      const embeds: EmbedItem[] = JSON.parse(stored);
      const currentPath = location.pathname;

      // Filter active embeds that should show on current page
      const activeEmbeds = embeds.filter(embed => {
        if (!embed.isActive) return false;
        if (!embed.embedCode.trim()) return false;
        
        const showOnPages = embed.showOnPages || ['all'];
        
        // Check if should show on current page
        if (showOnPages.includes('all')) return true;
        
        // Map page values to paths
        const pagePathMap: Record<string, string> = {
          '/': '/',
          'home': '/',
          '/about': '/about',
          '/pricing': '/pricing',
          '/contact': '/contact',
          '/book-call': '/book-call',
          '/ai-automation': '/ai-automation',
          '/ai-lead-engine': '/ai-lead-engine',
          '/performance-marketing': '/performance-marketing',
          '/case-studies': '/case-studies',
          '/blog': '/blog',
          '/calculator': '/calculator'
        };

        return showOnPages.some(page => {
          const mappedPath = pagePathMap[page] || page;
          return currentPath === mappedPath || currentPath.startsWith(mappedPath + '/');
        });
      });

      // Inject embeds
      activeEmbeds.forEach(embed => {
        // Skip if already injected (for persistent scripts like analytics)
        if (embed.category === 'analytics' && injectedScripts.has(embed.id)) {
          return;
        }

        injectEmbed(embed);
        
        // Track analytics scripts to avoid re-injection
        if (embed.category === 'analytics') {
          setInjectedScripts(prev => new Set([...prev, embed.id]));
        }
      });

    } catch (error) {
      console.error('Error loading embeds:', error);
    }
  }, [location.pathname, injectedScripts]);

  return null; // This component doesn't render anything
}

function injectEmbed(embed: EmbedItem) {
  const embedCode = embed.embedCode.trim();
  
  // Check if it's a script tag
  if (embedCode.includes('<script')) {
    // Extract and execute scripts
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    const srcRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
    
    let match;
    
    // Handle external scripts
    while ((match = srcRegex.exec(embedCode)) !== null) {
      const src = match[1];
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.dataset.embedId = embed.id;
        document.head.appendChild(script);
      }
    }
    
    // Handle inline scripts
    while ((match = scriptRegex.exec(embedCode)) !== null) {
      const inlineCode = match[1].trim();
      if (inlineCode && !inlineCode.startsWith('//')) {
        try {
          // Use Function constructor instead of eval for slightly better security
          const fn = new Function(inlineCode);
          fn();
        } catch (error) {
          console.error('Error executing embed script:', error);
        }
      }
    }
  }
  
  // Handle iframes and other HTML elements
  if (embedCode.includes('<iframe') || embedCode.includes('<div')) {
    // Create a container for the embed
    const containerId = `embed-container-${embed.id}`;
    
    // Remove existing container if present
    const existing = document.getElementById(containerId);
    if (existing) {
      existing.remove();
    }
    
    // Create new container
    const container = document.createElement('div');
    container.id = containerId;
    container.innerHTML = embedCode;
    
    // For calendar/form embeds, append to body
    if (embed.category === 'calendar' || embed.category === 'form') {
      // These usually need a specific target element - skip for now
      // User should place them manually or use a specific component
    }
  }
}
