import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  MapPin,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { API_ENDPOINTS } from "@/lib/api";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  business: string;
  message: string;
  service_type: string;
  page_source: string;
  country: string;
  city: string;
  created_at: string;
  status: string;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.leads, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      // Mock data for development
      setLeads([
        {
          id: 1,
          name: "John Smith",
          email: "john@example.com",
          phone: "+1 234 567 8900",
          business: "Tech Startup",
          message: "Looking for performance marketing services",
          service_type: "Performance Marketing",
          page_source: "/performance-marketing",
          country: "United States",
          city: "New York",
          created_at: "2024-12-07 10:30:00",
          status: "new",
        },
        {
          id: 2,
          name: "Sarah Johnson",
          email: "sarah@company.com",
          phone: "+1 987 654 3210",
          business: "E-commerce Brand",
          message: "Need help with AI automation",
          service_type: "AI Automation",
          page_source: "/ai-automation",
          country: "United Kingdom",
          city: "London",
          created_at: "2024-12-06 14:15:00",
          status: "contacted",
        },
        {
          id: 3,
          name: "Michael Chen",
          email: "michael@startup.io",
          phone: "+852 1234 5678",
          business: "SaaS Company",
          message: "Interested in your AI Lead Engine product",
          service_type: "AI Lead Engine",
          page_source: "/ai-lead-engine",
          country: "Hong Kong",
          city: "Central",
          created_at: "2024-12-05 09:45:00",
          status: "qualified",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: "bg-emerald-100 text-emerald-700",
      contacted: "bg-blue-100 text-blue-700",
      qualified: "bg-amber-100 text-amber-700",
      proposal: "bg-purple-100 text-purple-700",
      won: "bg-green-100 text-green-700",
      lost: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.business.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExportCSV = () => {
    // Define headers
    const headers = ["ID", "Name", "Email", "Phone", "Business", "Service", "Country", "City", "Status", "Date"];

    // Map data to CSV rows
    const csvRows = [
      headers.join(","), // Header row
      ...leads.map(lead => [
        lead.id,
        `"${lead.name}"`, // Quote strings to handle commas
        `"${lead.email}"`,
        `"${lead.phone || ''}"`,
        `"${lead.business || ''}"`,
        `"${lead.service_type || ''}"`,
        `"${lead.country || ''}"`,
        `"${lead.city || ''}"`,
        lead.status,
        `"${lead.created_at}"`
      ].join(","))
    ];

    // Create blobs and download
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Helmet>
        <title>Leads | HireMediaMind Admin</title>
      </Helmet>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />

          <main className="flex-1 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Leads</h1>
                <p className="text-muted-foreground mt-1">
                  Manage and track all your leads
                </p>
              </div>
              <Button className="btn-primary" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6 border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Leads Table */}
            <Card className="border-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Loading leads...
                          </TableCell>
                        </TableRow>
                      ) : filteredLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No leads found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">{lead.name}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {lead.business}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm flex items-center gap-1 text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {lead.email}
                                </p>
                                {lead.phone && (
                                  <p className="text-sm flex items-center gap-1 text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {lead.phone}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{lead.service_type}</span>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {lead.city}, {lead.country}
                              </p>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusBadge(lead.status)}`}>
                                {lead.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDate(lead.created_at)}
                              </p>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Update Status</DropdownMenuItem>
                                  <DropdownMenuItem>Send Email</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
