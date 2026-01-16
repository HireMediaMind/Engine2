import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Download, Globe, Mail, Phone, Star, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Lead {
    name: string;
    phone: string;
    email: string;
    address: string;
    rating: string;
    website: string;
    suggestedEmails?: string[];
    enriched?: boolean;
    enrichStatus?: string;
    source?: string;
}

// Data for Dropdowns
const INDUSTRIES = [
    "Restaurants", "Dentists", "Real Estate Agents", "Plumbers", "Electricians",
    "Lawyers", "Gyms", "Cafes", "Marketing Agencies", "Accounting Firms",
    "Construction Companies", "Software Companies", "Retail Stores", "Hotels",
    "Car Dealerships", "Beauty Salons", "Doctors", "Event Planners",
    "Interior Designers", "Architects", "Consultants", "E-commerce Brands"
];

const LOCATIONS = {
    "India": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Gurgaon", "Noida"],
    "USA": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Miami", "Seattle"],
    "UK": ["London", "Birmingham", "Manchester", "Glasgow", "Leeds", "Liverpool", "Newcastle", "Sheffield", "Bristol", "Belfast"],
    "UAE": ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman"],
    "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton", "Ottawa"],
    "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast"],
    "Singapore": ["Singapore"],
    "Netherlands": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht"],
    "New Zealand": ["Auckland", "Wellington", "Christchurch"]
};

const LeadFinder = () => {
    // Search State
    const [selectedIndustry, setSelectedIndustry] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedCity, setSelectedCity] = useState("");

    // Result State
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [enriching, setEnriching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [credits, setCredits] = useState(5);
    const [cacheInfo, setCacheInfo] = useState<{ isCached: boolean; time: string } | null>(null);

    // Get available cities based on country
    const availableCities = useMemo(() => {
        if (!selectedCountry) return [];
        return LOCATIONS[selectedCountry as keyof typeof LOCATIONS] || [];
    }, [selectedCountry]);

    const enrichLeads = async (currentLeads: Lead[]) => {
        const toEnrich = currentLeads.filter(l => !l.email && l.website && !l.enriched);

        if (toEnrich.length === 0) return;

        setEnriching(true);

        try {
            const response = await fetch("/api/lead-enrich.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businesses: toEnrich,
                    maxEnrich: 10 // Enrich top 10 at a time
                }),
            });

            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } catch (e) { console.error("Enrich Parse Error", text); return; }

            if (data.success && data.data) {
                // Merge enriched data back into leads
                setLeads(prevLeads => {
                    const newLeads = [...prevLeads];
                    data.data.forEach((enrichedLead: Lead) => {
                        const index = newLeads.findIndex(l => l.name === enrichedLead.name);
                        if (index !== -1) {
                            newLeads[index] = { ...newLeads[index], ...enrichedLead };
                        }
                    });
                    return newLeads;
                });
                if (data.emailsFound > 0) {
                    toast.success(`Found ${data.emailsFound} extra emails via enrichment!`);
                }
            }
        } catch (error) {
            console.error("Enrichment error:", error);
        } finally {
            setEnriching(false);
        }
    };

    const handleSearch = async () => {
        if (!selectedIndustry || !selectedCountry || !selectedCity) {
            toast.error("Please select Industry, Country, and City");
            return;
        }

        if (credits <= 0) {
            toast.error("You have used all your free searches. Please upgrade.");
            return;
        }

        setLoading(true);
        setLeads([]);
        setCacheInfo(null);
        setHasSearched(false);

        const fullLocation = `${selectedCity}, ${selectedCountry}`;

        try {
            // Using the CACHED V3 Endpoint
            const response = await fetch("/api/lead-finder-cached.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    industry: selectedIndustry,
                    location: fullLocation
                }),
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("JSON Parse Error:", text);
                throw new Error("Server returned invalid response. Please try again.");
            }

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch leads");
            }

            if (data.success && data.data && data.data.length > 0) {
                setLeads(data.data);
                if (!data.cached && credits > 0) {
                    setCredits((prev) => prev - 1); // Deduct credit only on cache miss (fresh search)
                }

                setCacheInfo({
                    isCached: data.cached,
                    time: data.executionTime
                });

                toast.success(`Found ${data.count} leads in ${data.executionTime}!`);

                // Trigger Background Enrichment
                enrichLeads(data.data);

            } else {
                toast.error(data.message || "No verified leads found.");
                setLeads([]);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "An error occurred while fetching leads");
        } finally {
            setLoading(false);
            setHasSearched(true);
        }
    };

    const exportToCSV = () => {
        if (leads.length === 0) return;

        const headers = ["Name", "Phone", "Email", "Address", "Rating", "Website", "Suggested Emails"];
        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...leads.map((l) => {
                const suggested = l.suggestedEmails ? l.suggestedEmails.join("; ") : "";
                return `"${l.name}","${l.phone}","${l.email}","${l.address}","${l.rating}","${l.website}","${suggested}"`;
            })].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `leads_${selectedIndustry}_${selectedCity}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV Downloaded!");
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex-1 bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
                        >
                            AI Lead Finder <span className="text-blue-600 text-3xl align-top">Pro</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-slate-600 max-w-2xl mx-auto"
                        >
                            Instant cached results. Deep enrichment. Global Coverage.
                        </motion.p>
                    </div>

                    {/* Search Card */}
                    <Card className="border-slate-200 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500 fill-current" />
                                Fast Search
                            </CardTitle>
                            <CardDescription>Select criteria. Results cached for 24h.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                {/* Industry */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Industry</label>
                                    <Select onValueChange={setSelectedIndustry} value={selectedIndustry}>
                                        <SelectTrigger><SelectValue placeholder="Select Industry" /></SelectTrigger>
                                        <SelectContent>
                                            {INDUSTRIES.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Country */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Country</label>
                                    <Select onValueChange={(val) => { setSelectedCountry(val); setSelectedCity(""); }} value={selectedCountry}>
                                        <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(LOCATIONS).map(country => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* City */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">City</label>
                                    <Select disabled={!selectedCountry} onValueChange={setSelectedCity} value={selectedCity}>
                                        <SelectTrigger><SelectValue placeholder={selectedCountry ? "Select City" : "..."} /></SelectTrigger>
                                        <SelectContent>
                                            {availableCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button onClick={handleSearch} disabled={loading || !selectedIndustry || !selectedCity} className="w-full bg-blue-600 hover:bg-blue-700">
                                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</> : <><Search className="mr-2 h-4 w-4" /> Find Leads</>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results Section */}
                    {hasSearched && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="border-slate-200 shadow-lg overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50 border-b">
                                    <div className="space-y-1">
                                        <CardTitle>Results</CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            Found {leads.length} leads.
                                            {cacheInfo && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${cacheInfo.isCached ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {cacheInfo.isCached ? '⚡ Instant (Cached)' : `⏱️ ${cacheInfo.time}`}
                                                </span>
                                            )}
                                            {enriching && (
                                                <span className="flex items-center gap-1 text-xs text-amber-600 animate-pulse">
                                                    <Loader2 className="h-3 w-3 animate-spin" /> Enriching Data...
                                                </span>
                                            )}
                                        </CardDescription>
                                    </div>
                                    {leads.length > 0 && (
                                        <Button variant="outline" onClick={exportToCSV} className="gap-2">
                                            <Download className="h-4 w-4" /> Export CSV
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="p-0">
                                    {leads.length === 0 ? (
                                        <div className="p-12 text-center text-slate-500">
                                            <Search className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                                            <p className="text-lg font-medium">No leads found</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto max-h-[600px]">
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-white z-10">
                                                    <TableRow>
                                                        <TableHead>Business Name</TableHead>
                                                        <TableHead>Contact Info</TableHead>
                                                        <TableHead>Location</TableHead>
                                                        <TableHead className="text-right">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {leads.map((lead, idx) => (
                                                        <TableRow key={idx} className="hover:bg-slate-50/50">
                                                            <TableCell className="font-medium align-top">
                                                                <div className="font-semibold text-slate-900">{lead.name}</div>
                                                                {lead.website && (
                                                                    <a href={lead.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                                                        <Globe className="h-3 w-3" /> Website
                                                                    </a>
                                                                )}
                                                                {lead.rating && (
                                                                    <div className="flex items-center gap-1 text-amber-500 text-xs mt-1">
                                                                        <Star className="h-3 w-3 fill-current" /> {lead.rating}
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="align-top">
                                                                <div className="space-y-1">
                                                                    {lead.phone && (
                                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                            <Phone className="h-3 w-3 shrink-0" /> {lead.phone}
                                                                        </div>
                                                                    )}
                                                                    {lead.email ? (
                                                                        <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                                                                            <Mail className="h-3 w-3 shrink-0" /> {lead.email}
                                                                            <CheckCircle2 className="h-3 w-3" />
                                                                        </div>
                                                                    ) : lead.suggestedEmails && lead.suggestedEmails.length > 0 ? (
                                                                        <div className="text-xs text-slate-500">
                                                                            <div className="flex items-center gap-1 mb-1 italic">
                                                                                <Mail className="h-3 w-3" /> Suggested:
                                                                            </div>
                                                                            {lead.suggestedEmails.map((se, i) => (
                                                                                <div key={i}>{se}</div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-xs text-slate-400 italic">No email found</div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-slate-600 align-top max-w-[200px]">
                                                                {lead.address}
                                                            </TableCell>
                                                            <TableCell className="text-right align-top">
                                                                <Button size="sm" variant="ghost">Save</Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default LeadFinder;
