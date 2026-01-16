import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

export interface Announcement {
  id: string;
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

export const useAnnouncements = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return useQuery({
    queryKey: ["announcements", currentPath],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("enabled", true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order("priority", { ascending: false });

      if (error) throw error;

      // Filter by target pages
      const filtered = (data as Announcement[])?.filter((announcement) => {
        const targets = announcement.target_pages || ["all"];
        if (targets.includes("all")) return true;
        
        // Map page names to paths
        const pagePathMap: Record<string, string> = {
          home: "/",
          pricing: "/pricing",
          "ai-automation": "/services/ai-automation",
          "performance-marketing": "/services/performance-marketing",
        };

        return targets.some((target) => {
          const path = pagePathMap[target];
          return path === currentPath || currentPath.startsWith(path + "/");
        });
      });

      return filtered || [];
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useAllAnnouncements = () => {
  return useQuery({
    queryKey: ["all-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("priority", { ascending: false });

      if (error) throw error;
      return data as Announcement[];
    },
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (announcement: Omit<Partial<Announcement>, 'id' | 'created_at' | 'updated_at'> & { title: string; message: string }) => {
      const { data, error } = await supabase
        .from("announcements")
        .insert([announcement])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["all-announcements"] });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Announcement> & { id: string }) => {
      const { data, error } = await supabase
        .from("announcements")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["all-announcements"] });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["all-announcements"] });
    },
  });
};
