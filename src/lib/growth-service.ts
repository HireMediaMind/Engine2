
const API_BASE = '/api/admin/growth';

export interface Workflow {
    id: number;
    name: string;
    category: 'Leads' | 'Outreach' | 'Ads' | 'Custom';
    webhook_path: string;
    description?: string;
    is_active: number;
    created_at?: string;
}

export interface GrowthLog {
    id: number;
    workflow_id: number;
    status: 'success' | 'error';
    payload: any;
    response: any;
    executed_at: string;
}

export const GrowthService = {
    // --- Workflows ---
    getWorkflows: async (category?: string) => {
        const url = category ? `${API_BASE}/workflows.php?category=${category}` : `${API_BASE}/workflows.php`;
        const res = await fetch(url);
        return res.json();
    },

    createWorkflow: async (workflow: Partial<Workflow>) => {
        const res = await fetch(`${API_BASE}/workflows.php`, {
            method: 'POST',
            body: JSON.stringify(workflow),
        });
        return res.json();
    },

    toggleWorkflow: async (id: number, isActive: boolean) => {
        const res = await fetch(`${API_BASE}/workflows.php`, {
            method: 'PUT',
            body: JSON.stringify({ id, is_active: isActive ? 1 : 0 }),
        });
        return res.json();
    },

    deleteWorkflow: async (id: number) => {
        const res = await fetch(`${API_BASE}/workflows.php?id=${id}`, {
            method: 'DELETE',
        });
        return res.json();
    },

    // --- Settings ---
    getSettings: async () => {
        const res = await fetch(`${API_BASE}/settings.php`);
        return res.json();
    },

    saveSettings: async (settings: { n8n_base_url?: string; n8n_secret_key?: string }) => {
        const res = await fetch(`${API_BASE}/settings.php`, {
            method: 'POST',
            body: JSON.stringify(settings),
        });
        return res.json();
    },

    // --- Execution ---
    triggerWorkflow: async (workflowId: number, payload: any) => {
        const res = await fetch(`${API_BASE}/trigger.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workflowId, payload }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Execution failed');
        }
        return res.json();
    }
};
