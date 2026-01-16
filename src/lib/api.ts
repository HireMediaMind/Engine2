/**
 * API Configuration
 *
 * IMPORTANT:
 * - In production on Hostinger, your PHP API lives under `/api` on the SAME domain.
 * - In Lovable preview, PHP doesn't run, so we use the full Hostinger URL.
 */

// Detect if we're in Lovable preview or production
const isLovablePreview = typeof window !== 'undefined' &&
  (window.location.hostname.includes('lovable.app') ||
    window.location.hostname.includes('localhost') ||
    window.location.hostname.includes('127.0.0.1'));

// Use full Hostinger URL in preview, relative URL in production
export const API_BASE_URL = isLovablePreview
  ? "https://hiremediamind.com/api"
  : "/api";

// API endpoints
export const API_ENDPOINTS = {
  submitLead: `${API_BASE_URL}/submit-lead.php`,
  leads: `${API_BASE_URL}/leads.php`,
  pipeline: `${API_BASE_URL}/pipeline.php`,
  dashboardStats: `${API_BASE_URL}/dashboard-stats.php`,
  analytics: `${API_BASE_URL}/analytics.php`,
  auth: `${API_BASE_URL}/admin/auth.php`,
  leadActions: `${API_BASE_URL}/lead-actions.php`,
  emailSequences: `${API_BASE_URL}/email-sequences.php`,
  sendEmail: `${API_BASE_URL}/send-email.php`,
  // Chatbot endpoints
  chatbotConfig: `${API_BASE_URL}/chatbot/config.php`,
  chatbotKnowledge: `${API_BASE_URL}/chatbot/knowledge.php`,
  chatbotChat: `${API_BASE_URL}/chatbot/chat.php`,
  chatbotSessions: `${API_BASE_URL}/chatbot/sessions.php`,
  // Announcements (PHP-based for Hostinger)
  announcements: `${API_BASE_URL}/announcements.php`,
  clientPreview: `${API_BASE_URL}/client-preview.php`,
  adminPreviews: `${API_BASE_URL}/admin/previews.php`,
  chatProxy: `${API_BASE_URL}/chat-proxy.php`,
};

// Helper function for API calls
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session
    ...options,
  };

  const response = await fetch(endpoint, defaultOptions);
  return response;
}
