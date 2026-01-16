import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Only allows safe tags and attributes
 */
export function sanitizeHtml(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'br', 'a', 'p', 'span', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
  });
}

/**
 * Formats markdown-like content to HTML and sanitizes it
 */
export function formatAndSanitizeMessage(content: string): string {
  const formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
    .replace(/\n/g, '<br />');
  
  return sanitizeHtml(formatted);
}
