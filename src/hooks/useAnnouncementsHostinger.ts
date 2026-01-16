import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { API_ENDPOINTS } from "@/lib/api";
import { getAuthHeaders } from "@/lib/hostinger-auth";

export interface Announcement {
  id: number;
  enabled: boolean;
  announcement_type: 'info' | 'success' | 'warning' | 'promo' | 'maintenance';
  title: string;
  message: string;
  cta_text: string | null;
  cta_link: string | null;
  icon: string | null;
  start_date: string | null;
  end_date: string | null;
  target_pages: string[];
  priority: number;
  created_at: string;
  updated_at: string;
}

export const useAnnouncementsHostinger = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return useQuery({
    queryKey: ["announcements-hostinger", currentPath],
    queryFn: async () => {
      try {
        const response = await fetch(API_ENDPOINTS.announcements, {
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.announcements) {
          // Filter by target pages
          const filtered = data.announcements.filter((announcement: Announcement) => {
            const targets = announcement.target_pages || ["all"];
            if (targets.includes("all")) return true;
            
            const pagePathMap: Record<string, string> = {
              home: "/",
              pricing: "/pricing",
              "ai-automation": "/services/ai-automation",
              "performance-marketing": "/services/performance-marketing",
            };

            return targets.some((target) => {
              const path = pagePathMap[target] || `/${target}`;
              return path === currentPath || currentPath.startsWith(path + "/");
            });
          });
          
          return filtered;
        }
        
        return [];
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
        return [];
      }
    },
    staleTime: 30000,
  });
};

export const useAllAnnouncementsHostinger = () => {
  return useQuery({
    queryKey: ["all-announcements-hostinger"],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.announcements}?all=true`, {
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.announcements) {
          return data.announcements as Announcement[];
        }
        
        return [];
      } catch (error) {
        console.error('Failed to fetch all announcements:', error);
        return [];
      }
    },
  });
};

export const useCreateAnnouncementHostinger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (announcement: Omit<Partial<Announcement>, 'id' | 'created_at' | 'updated_at'> & { title: string; message: string }) => {
      const response = await fetch(API_ENDPOINTS.announcements, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(announcement)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create announcement');
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements-hostinger"] });
      queryClient.invalidateQueries({ queryKey: ["all-announcements-hostinger"] });
    },
  });
};

export const useUpdateAnnouncementHostinger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Announcement> & { id: number }) => {
      const response = await fetch(API_ENDPOINTS.announcements, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ id, ...updates })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update announcement');
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements-hostinger"] });
      queryClient.invalidateQueries({ queryKey: ["all-announcements-hostinger"] });
    },
  });
};

export const useDeleteAnnouncementHostinger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_ENDPOINTS.announcements}?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete announcement');
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements-hostinger"] });
      queryClient.invalidateQueries({ queryKey: ["all-announcements-hostinger"] });
    },
  });
};
