import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Plus, Ban, Download } from "lucide-react";
import { generatePartnerPDF } from "@/utils/pdfGenerator";

// Types
interface Partner {
    id: number;
    name: string;
    role: string;
    joining_date: string;
    status: 'Active' | 'Revoked' | 'Draft';
    document_id: string;
}

export default function Partners() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        role: "Official Partner",
        email: "",
        joining_date: "",
        scope_of_work: "Strategic Consulting & Business Development",
        revenue_model: "10% of Net Profit",
        validity_period: "Indefinite"
    });

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const response = await fetch('/api/admin/hr/partners.php', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) setPartners(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load partners", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/admin/hr/partners.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed');

            const result = await response.json();

            // Auto-Active & Generate PDF
            await handleStatusChange(result.id, 'Active');

            // Generate PDF Client Side
            generatePartnerPDF({
                ...formData,
                document_id: result.document_id,
                date: new Date().toLocaleDateString()
            });

            toast({ title: "Success", description: "Partner added & Agreement generated" });
            setIsDialogOpen(false);
            fetchPartners();

        } catch (error) {
            toast({ title: "Error", description: "Failed to create partner", variant: "destructive" });
        }
    };

    const handleStatusChange = async (id: number, status: string) => {
        await fetch('/api/admin/hr/partners.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            },
            body: JSON.stringify({ id, status })
        });
        fetchPartners();
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
                    <p className="text-muted-foreground">Manage your strategic partnerships.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Partner</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Partner</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                <Input placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Select value={formData.role} onValueChange={v => setFormData({ ...formData, role: v })}>
                                    <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Official Partner">Official Partner</SelectItem>
                                        <SelectItem value="Silent Partner">Silent Partner</SelectItem>
                                        <SelectItem value="Advisor">Advisor</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input type="date" value={formData.joining_date} onChange={e => setFormData({ ...formData, joining_date: e.target.value })} />
                            </div>
                            <Input placeholder="Scope of Work" value={formData.scope_of_work} onChange={e => setFormData({ ...formData, scope_of_work: e.target.value })} />
                            <Input placeholder="Revenue Model" value={formData.revenue_model} onChange={e => setFormData({ ...formData, revenue_model: e.target.value })} />
                            <Button onClick={handleSubmit} className="w-full mt-4">Generate Agreement & Activate</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Doc ID</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {partners.map((partner) => (
                            <TableRow key={partner.id}>
                                <TableCell className="font-medium">{partner.name}</TableCell>
                                <TableCell>{partner.role}</TableCell>
                                <TableCell>{partner.joining_date}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${partner.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            partner.status === 'Revoked' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                                        }`}>
                                        {partner.status}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{partner.document_id}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => generatePartnerPDF({ ...partner, date: new Date().toLocaleDateString() } as any)}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    {partner.status === 'Active' && (
                                        <Button variant="destructive" size="sm" onClick={() => handleStatusChange(partner.id, 'Revoked')}>
                                            <Ban className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
