import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

export interface Offer {
  id: string;
  enabled: boolean;
  title: string;
  description: string | null;
  discount_type: 'percentage' | 'flat' | 'message_only';
  discount_value: number;
  target_pages: string[];
  target_plans: string[];
  start_date: string | null;
  end_date: string | null;
  badge_text: string;
  created_at: string;
  updated_at: string;
}

export const useActiveOffers = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return useQuery({
    queryKey: ["active-offers", currentPath],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("enabled", true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`);

      if (error) throw error;

      // Filter by target pages
      const filtered = (data as Offer[])?.filter((offer) => {
        const targets = offer.target_pages || ["all"];
        if (targets.includes("all")) return true;
        
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
    staleTime: 30000,
  });
};

export const useAllOffers = () => {
  return useQuery({
    queryKey: ["all-offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Offer[];
    },
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (offer: Omit<Partial<Offer>, 'id' | 'created_at' | 'updated_at'> & { title: string }) => {
      const { data, error } = await supabase
        .from("offers")
        .insert([offer])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-offers"] });
      queryClient.invalidateQueries({ queryKey: ["all-offers"] });
    },
  });
};

export const useUpdateOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Offer> & { id: string }) => {
      const { data, error } = await supabase
        .from("offers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-offers"] });
      queryClient.invalidateQueries({ queryKey: ["all-offers"] });
    },
  });
};

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("offers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-offers"] });
      queryClient.invalidateQueries({ queryKey: ["all-offers"] });
    },
  });
};

// Helper function to calculate discounted price
export const calculateDiscountedPrice = (
  originalPrice: number,
  offer: Offer
): number => {
  if (offer.discount_type === 'message_only') {
    return originalPrice;
  }
  
  if (offer.discount_type === 'percentage') {
    return originalPrice - (originalPrice * offer.discount_value / 100);
  }
  
  if (offer.discount_type === 'flat') {
    return Math.max(0, originalPrice - offer.discount_value);
  }
  
  return originalPrice;
};

// Helper to check if an offer applies to a specific plan
export const offerAppliesToPlan = (offer: Offer, planName: string): boolean => {
  const targets = offer.target_plans || ["all"];
  if (targets.includes("all")) return true;
  return targets.some((t) => t.toLowerCase() === planName.toLowerCase());
};
