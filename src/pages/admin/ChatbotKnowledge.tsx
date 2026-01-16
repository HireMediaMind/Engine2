import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import AuthGuard from '@/components/admin/AuthGuard';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, BookOpen, Sparkles, Download } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface KnowledgeEntry {
  id: number;
  category: string;
  question: string;
  keywords: string;
  answer: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  category: string;
  question: string;
  keywords: string;
  answer: string;
  priority: number;
  is_active: boolean;
}

const defaultFormData: FormData = {
  category: 'general',
  question: '',
  keywords: '',
  answer: '',
  priority: 0,
  is_active: true
};

export default function ChatbotKnowledge() {
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    fetchKnowledge();
  }, [selectedCategory]);

  const fetchKnowledge = async () => {
    try {
      const url = selectedCategory === 'all' 
        ? `${API_BASE_URL}/chatbot/knowledge.php`
        : `${API_BASE_URL}/chatbot/knowledge.php?category=${selectedCategory}`;
      
      // Get token for auth
      const token = localStorage.getItem('hmm_admin_token');
      
      const response = await fetch(url, { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}`, 'X-Admin-Token': token } : {})
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setKnowledge(data.knowledge || []);
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      toast.error('Failed to load knowledge base');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedKnowledge = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/seed-knowledge.php`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchKnowledge();
      } else {
        toast.error(data.error || 'Failed to seed knowledge');
      }
    } catch (error) {
      console.error('Error seeding knowledge:', error);
      toast.error('Failed to seed knowledge base');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }

    setIsSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;
      const token = localStorage.getItem('hmm_admin_token');
      
      const response = await fetch(`${API_BASE_URL}/chatbot/knowledge.php`, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}`, 'X-Admin-Token': token } : {})
        },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(editingId ? 'Knowledge updated!' : 'Knowledge added!');
        setIsDialogOpen(false);
        setFormData(defaultFormData);
        setEditingId(null);
        fetchKnowledge();
      } else {
        toast.error(data.error || 'Failed to save knowledge');
      }
    } catch (error) {
      console.error('Error saving knowledge:', error);
      toast.error('Failed to save knowledge');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (entry: KnowledgeEntry) => {
    setFormData({
      category: entry.category,
      question: entry.question,
      keywords: entry.keywords,
      answer: entry.answer,
      priority: entry.priority,
      is_active: entry.is_active
    });
    setEditingId(entry.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/knowledge.php?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Knowledge deleted!');
        fetchKnowledge();
      } else {
        toast.error(data.error || 'Failed to delete knowledge');
      }
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      toast.error('Failed to delete knowledge');
    }
  };

  const filteredKnowledge = knowledge.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.question.toLowerCase().includes(query) ||
      entry.answer.toLowerCase().includes(query) ||
      entry.keywords.toLowerCase().includes(query)
    );
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      company: 'bg-blue-500/10 text-blue-500',
      performance_marketing: 'bg-purple-500/10 text-purple-500',
      ai_automation: 'bg-green-500/10 text-green-500',
      products: 'bg-amber-500/10 text-amber-500',
      process: 'bg-cyan-500/10 text-cyan-500',
      results: 'bg-emerald-500/10 text-emerald-500',
      faq: 'bg-pink-500/10 text-pink-500',
      contact: 'bg-indigo-500/10 text-indigo-500',
      general: 'bg-gray-500/10 text-gray-500'
    };
    return colors[category] || colors.general;
  };

  return (
    <AuthGuard>
      <Helmet>
        <title>Knowledge Base | Admin</title>
      </Helmet>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar />
          <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
              <p className="text-muted-foreground mt-1">Train your chatbot with Q&A pairs</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSeedKnowledge} disabled={isSeeding}>
                <Download className="mr-2 h-4 w-4" />
                {isSeeding ? 'Seeding...' : 'Load Default Knowledge'}
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setFormData(defaultFormData);
                  setEditingId(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Knowledge
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Knowledge Entry' : 'Add New Knowledge'}</DialogTitle>
                    <DialogDescription>
                      Add a question and answer pair to train your chatbot
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="performance_marketing">Performance Marketing</SelectItem>
                            <SelectItem value="ai_automation">AI Automation</SelectItem>
                            <SelectItem value="products">Products</SelectItem>
                            <SelectItem value="process">Process</SelectItem>
                            <SelectItem value="results">Results</SelectItem>
                            <SelectItem value="faq">FAQ</SelectItem>
                            <SelectItem value="contact">Contact</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority (0-100)</Label>
                        <Input
                          id="priority"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.priority}
                          onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="question">Question / Trigger</Label>
                      <Input
                        id="question"
                        value={formData.question}
                        onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                        placeholder="What question should trigger this response?"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                      <Input
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                        placeholder="price, cost, pricing, how much"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Add keywords that should also trigger this response
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="answer">Answer</Label>
                      <Textarea
                        id="answer"
                        value={formData.answer}
                        onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                        placeholder="Enter the chatbot's response. Use **text** for bold."
                        rows={6}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports **bold** and line breaks. Keep responses concise but helpful.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                      {isSaving ? 'Saving...' : (editingId ? 'Update' : 'Add')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{knowledge.length}</p>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-green-500/10 p-3">
                  <Sparkles className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{knowledge.filter(k => k.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Active Entries</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-purple-500/10 p-3">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{categories.length}</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Knowledge List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredKnowledge.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No knowledge entries yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding Q&A pairs or load the default knowledge base
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={handleSeedKnowledge} disabled={isSeeding}>
                  Load Default Knowledge
                </Button>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Entry
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredKnowledge.map((entry) => (
                <Card key={entry.id} className={!entry.is_active ? 'opacity-60' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(entry.category)}>
                            {entry.category.replace(/_/g, ' ')}
                          </Badge>
                          <Badge variant="outline">Priority: {entry.priority}</Badge>
                          {!entry.is_active && <Badge variant="secondary">Inactive</Badge>}
                        </div>
                        <CardTitle className="text-base">{entry.question}</CardTitle>
                        {entry.keywords && (
                          <CardDescription className="mt-1">
                            Keywords: {entry.keywords}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap">
                      {entry.answer}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
