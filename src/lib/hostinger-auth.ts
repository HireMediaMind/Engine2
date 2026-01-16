/**
 * Hostinger PHP/MySQL Authentication
 *
 * NOTE ABOUT PREVIEW:
 * - Lovable preview cannot execute PHP.
 * - This auth will work after you upload to Hostinger.
 */

// Detect if we're in Lovable preview or production
const isLovablePreview = typeof window !== 'undefined' && 
  (window.location.hostname.includes('lovable.app') || 
   window.location.hostname.includes('localhost') ||
   window.location.hostname.includes('127.0.0.1'));

// Use full Hostinger URL in preview, relative URL in production
const HOSTINGER_API_URL = isLovablePreview 
  ? "https://hiremediamind.com/api/admin" 
  : "/api/admin";

export interface AdminUser {
  id: number;
  email: string;
  display_name: string;
  role: "super_admin" | "admin" | "moderator";
}

export interface AuthResponse {
  success: boolean;
  user?: AdminUser;
  token?: string;
  expires_at?: string;
  error?: string;
  message?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: AdminUser;
  error?: string;
}

const TOKEN_KEY = "hmm_admin_token";
const USER_KEY = "hmm_admin_user";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AdminUser | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function storeUser(user: AdminUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Get auth headers for API calls
export function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}`, 'X-Admin-Token': token } : {})
  };
}

// Make authenticated API call
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });
}

function isPhpUnavailableError(err: unknown): boolean {
  // In preview we typically see TypeError: Failed to fetch / network errors.
  return err instanceof TypeError;
}

async function safeJson(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    // PHP might output warnings/HTML when misconfigured
    return { success: false, error: "Server returned an invalid response." };
  }
}

/** Login */
export async function loginAdmin(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${HOSTINGER_API_URL}/auth.php?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await safeJson(response);

    if (data.success && data.token) {
      storeToken(data.token);
      if (data.user) {
        storeUser(data.user);
      }
    }

    // Normalize error shape
    if (!data.success && !data.error && data.message) data.error = data.message;

    return data;
  } catch (error) {
    if (isPhpUnavailableError(error)) {
      return {
        success: false,
        error:
          "Admin login works after uploading to Hostinger (PHP is not available in this preview).",
      };
    }
    return { success: false, error: "Connection failed. Please try again." };
  }
}

/** Signup */
export async function signupAdmin(email: string, password: string, displayName?: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${HOSTINGER_API_URL}/auth.php?action=signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, display_name: displayName }),
    });

    const data = await safeJson(response);

    if (data.success && data.token) {
      storeToken(data.token);
      if (data.user) {
        storeUser(data.user);
      }
    }

    if (!data.success && !data.error && data.message) data.error = data.message;

    return data;
  } catch (error) {
    if (isPhpUnavailableError(error)) {
      return {
        success: false,
        error:
          "Admin signup works after uploading to Hostinger (PHP is not available in this preview).",
      };
    }
    return { success: false, error: "Connection failed. Please try again." };
  }
}

/** Logout */
export async function logoutAdmin(): Promise<void> {
  try {
    const token = getStoredToken();
    await fetch(`${HOSTINGER_API_URL}/auth.php?action=logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}`, 'X-Admin-Token': token } : {}),
      },
    });
  } catch {
    // ignore
  } finally {
    clearToken();
  }
}

/** Session check */
export async function checkAdminSession(): Promise<SessionResponse> {
  const token = getStoredToken();
  if (!token) return { authenticated: false };

  try {
    const response = await fetch(`${HOSTINGER_API_URL}/auth.php?action=check`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        'X-Admin-Token': token,
      },
    });

    const data = await safeJson(response);

    if (!data.authenticated) {
      clearToken();
    } else if (data.user) {
      storeUser(data.user);
    }

    return data;
  } catch (error) {
    if (isPhpUnavailableError(error)) {
      return {
        authenticated: false,
        error:
          "Admin session check requires Hostinger PHP (not available in this preview).",
      };
    }
    return { authenticated: false, error: "Connection failed" };
  }
}

/** Setup DB tables (Hostinger only) */
export async function setupDatabase(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${HOSTINGER_API_URL}/auth.php?action=setup`, {
      method: "GET",
    });
    return await safeJson(response);
  } catch {
    return {
      success: false,
      error: "Setup works after uploading to Hostinger (PHP is not available in this preview).",
    };
  }
}
