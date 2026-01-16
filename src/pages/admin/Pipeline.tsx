import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { 
  User,
  Mail,
  Phone,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { API_ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PipelineLead {
  id: number;
  name: string;
  email: string;
  phone: string;
  business: string;
  value: number;
  stage: string;
}

const PIPELINE_STAGES = [
  { id: "new", label: "New Lead", color: "bg-blue-500" },
  { id: "booked", label: "Booked Call", color: "bg-purple-500" },
  { id: "showed", label: "Showed Up", color: "bg-amber-500" },
  { id: "proposal", label: "Proposal Sent", color: "bg-orange-500" },
  { id: "won", label: "Closed Won", color: "bg-emerald-500" },
  { id: "nurture", label: "Nurture", color: "bg-slate-500" },
];

export default function Pipeline() {
  const [leads, setLeads] = useState<PipelineLead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPipelineLeads();
  }, []);

  const fetchPipelineLeads = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.pipeline, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Ensure we have valid data
        if (Array.isArray(data)) {
          setLeads(data.map((lead: any) => ({
            id: lead.id,
            name: lead.name || 'Unknown',
            email: lead.email || '',
            phone: lead.phone || '',
            business: lead.business || lead.service_type || '',
            value: lead.value || 0,
            stage: lead.stage || 'new'
          })));
        }
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (error) {
      console.error('Failed to fetch pipeline leads:', error);
      // No mock data - show empty state
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const getLeadsByStage = (stageId: string) => {
    return leads.filter((lead) => lead.stage === stageId);
  };

  const getStageTotal = (stageId: string) => {
    return getLeadsByStage(stageId).reduce((sum, lead) => sum + lead.value, 0);
  };

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    e.dataTransfer.setData("leadId", leadId.toString());
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const leadId = parseInt(e.dataTransfer.getData("leadId"));
    
    // Optimistically update UI
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === leadId ? { ...lead, stage: newStage } : lead
      )
    );

    // Update stage via API
    try {
      const response = await fetch(API_ENDPOINTS.leadActions, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: leadId, stage: newStage }),
      });

      if (response.ok) {
        toast({
          title: "Lead updated",
          description: `Lead moved to ${newStage}`,
        });
      }
    } catch (error) {
      console.error('Failed to update lead stage:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <Helmet>
        <title>Pipeline | HireMediaMind Admin</title>
      </Helmet>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          
          <main className="flex-1 p-6 lg:p-8 overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">CRM Pipeline</h1>
                <p className="text-muted-foreground mt-1">
                  Drag and drop leads between stages
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ${leads.reduce((sum, lead) => sum + lead.value, 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Pipeline Kanban */}
            <div className="flex gap-4 overflow-x-auto pb-4 min-w-max">
              {PIPELINE_STAGES.map((stage) => (
                <div
                  key={stage.id}
                  className="w-72 flex-shrink-0"
                  onDrop={(e) => handleDrop(e, stage.id)}
                  onDragOver={handleDragOver}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <h3 className="font-semibold text-foreground">{stage.label}</h3>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        {getLeadsByStage(stage.id).length}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      ${getStageTotal(stage.id).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-3 min-h-[500px] bg-muted/30 rounded-xl p-3">
                    {loading ? (
                      <p className="text-center text-muted-foreground py-8">Loading...</p>
                    ) : (
                      getLeadsByStage(stage.id).map((lead) => (
                        <Card
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          className="cursor-grab active:cursor-grabbing border-border hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground text-sm">{lead.name}</p>
                                  <p className="text-xs text-muted-foreground">{lead.business}</p>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Send Email</DropdownMenuItem>
                                  <DropdownMenuItem>Add Note</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </p>
                              <p className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
                              <span className="text-sm font-semibold text-foreground">
                                ${lead.value.toLocaleString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
