import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Ban, Download } from "lucide-react";
import { generateEmployeePDF } from "@/utils/pdfGenerator";

// Types
interface Employee {
    id: number;
    name: string;
    designation: string;
    department: string;
    type: string;
    joining_date: string;
    status: 'Active' | 'Terminated' | 'Draft';
    document_id: string;
}

export default function Employees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        designation: "",
        department: "",
        type: "Full-Time",
        salary: "",
        joining_date: "",
        probation_period: "3 Months",
        reporting_manager: ""
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch('/api/admin/hr/employees.php', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) setEmployees(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load employees", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/admin/hr/employees.php', {
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
            generateEmployeePDF({
                ...formData,
                document_id: result.document_id,
                date: new Date().toLocaleDateString()
            });

            toast({ title: "Success", description: "Employee added & Offer Letter generated" });
            setIsDialogOpen(false);
            fetchEmployees();

        } catch (error) {
            toast({ title: "Error", description: "Failed to create employee", variant: "destructive" });
        }
    };

    const handleStatusChange = async (id: number, status: string) => {
        await fetch('/api/admin/hr/employees.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            },
            body: JSON.stringify({ id, status })
        });
        fetchEmployees();
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                    <p className="text-muted-foreground">Manage your workforce and offer letters.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Employee</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Employee</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                <Input placeholder="Designation" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="Department" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Full-Time">Full-Time</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                        <SelectItem value="Intern">Intern</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="Salary (e.g. ₹50,000/mo)" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
                                <Input type="date" value={formData.joining_date} onChange={e => setFormData({ ...formData, joining_date: e.target.value })} />
                            </div>
                            <Input placeholder="Reporting Manager" value={formData.reporting_manager} onChange={e => setFormData({ ...formData, reporting_manager: e.target.value })} />
                            <Button onClick={handleSubmit} className="w-full mt-4">Generate Offer Letter & Onboard</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Doc ID</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.map((emp) => (
                            <TableRow key={emp.id}>
                                <TableCell className="font-medium">{emp.name}</TableCell>
                                <TableCell>{emp.designation}</TableCell>
                                <TableCell>{emp.type}</TableCell>
                                <TableCell>{emp.joining_date}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${emp.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            emp.status === 'Terminated' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                                        }`}>
                                        {emp.status}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{emp.document_id}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => generateEmployeePDF({ ...emp, date: new Date().toLocaleDateString() } as any)}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    {emp.status === 'Active' && (
                                        <Button variant="destructive" size="sm" onClick={() => handleStatusChange(emp.id, 'Terminated')}>
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
