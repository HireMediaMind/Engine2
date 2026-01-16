import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/api";

export interface ClientPreview {
  id: string;
  token: string;
  client_name: string;
  client_email: string | null;
  title: string;
  description: string | null;
  preview_type: string;
  chatbot_config: Record<string, any>;
  workflow_config: Record<string, any>;
  status: string;
  expires_at: string | null;
  viewed_at: string | null;
  approved_at: string | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch all previews (Admin)
export const useClientPreviews = () => {
  return useQuery({
    queryKey: ["client-previews"],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.adminPreviews, {
        credentials: "include" // Send cookies for admin auth
      });
      if (!response.ok) throw new Error("Failed to fetch previews");
      const data = await response.json();
      return data as ClientPreview[];
    },
  });
};

// Fetch single preview by token (Public - used by ClientPreview.tsx)
// NOTE: ClientPreview.tsx now does its own fetch, but we keep this just in case
export const useClientPreviewByToken = (token: string) => {
  return useQuery({
    queryKey: ["client-preview", token],
    queryFn: async () => {
      // Logic moved to actual page component for simpler auth handling
      return null;
    },
    enabled: false,
  });
};

export interface CreateClientPreviewInput {
  client_name: string;
  client_email?: string | null;
  title: string;
  description?: string | null;
  preview_type?: string;
  chatbot_config?: Record<string, any>;
  workflow_config?: Record<string, any>;
  expires_at?: string | null;
}

// Create Preview (Admin)
export const useCreateClientPreview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preview: CreateClientPreviewInput) => {
      const response = await fetch(API_ENDPOINTS.adminPreviews, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(preview),
      });

      if (!response.ok) throw new Error("Failed to create preview");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-previews"] });
    },
  });
};

// Delete Preview (Admin)
export const useDeleteClientPreview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_ENDPOINTS.adminPreviews}?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-previews"] });
    },
  });
};
