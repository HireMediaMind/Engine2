import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import AuthGuard from '@/components/admin/AuthGuard';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff, 
  Code, 
  Bot, 
  BarChart3, 
  Calendar,
  MessageSquare,
  Sparkles,
  Save,
  X,
  ExternalLink,
  GripVertical
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmbedItem {
  id: string;
  name: string;
  description: string;
  category: 'ai-agent' | 'analytics' | 'calendar' | 'chat' | 'form' | 'custom';
  embedCode: string;
  isActive: boolean;
  showOnPages: string[];
  createdAt: string;
  order: number;
}

const categoryIcons = {
  'ai-agent': Bot,
  'analytics': BarChart3,
  'calendar': Calendar,
  'chat': MessageSquare,
  'form': Sparkles,
  'custom': Code,
};

const categoryLabels = {
  'ai-agent': 'AI Agent',
  'analytics': 'Analytics',
  'calendar': 'Calendar/Booking',
  'chat': 'Chat Widget',
  'form': 'Form/Lead Capture',
  'custom': 'Custom Embed',
};

const defaultEmbeds: EmbedItem[] = [
  {
    id: '1',
    name: 'Calendly Booking Widget',
    description: 'Embed Calendly for scheduling strategy calls',
    category: 'calendar',
    embedCode: '<div class="calendly-inline-widget" data-url="https://calendly.com/hiremediamind/strategy-call" style="min-width:320px;height:700px;"></div>\n<script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>',
    isActive: true,
    showOnPages: ['/book-call'],
    createdAt: new Date().toISOString(),
    order: 1
  },
  {
    id: '2',
    name: 'Google Analytics',
    description: 'Track website visitors and conversions',
    category: 'analytics',
    embedCode: '<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag(\'js\', new Date());\n  gtag(\'config\', \'GA_MEASUREMENT_ID\');\n</script>',
    isActive: false,
    showOnPages: ['all'],
    createdAt: new Date().toISOString(),
    order: 2
  }
];

export default function EmbedManager() {
  const [embeds, setEmbeds] = useState<EmbedItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmbed, setEditingEmbed] = useState<EmbedItem | null>(null);
  const [previewEmbed, setPreviewEmbed] = useState<EmbedItem | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom' as EmbedItem['category'],
    embedCode: '',
    showOnPages: ['all'],
    isActive: true,
  });

  useEffect(() => {
    // Load embeds from localStorage
    const stored = localStorage.getItem('embed_manager_items');
    if (stored) {
      setEmbeds(JSON.parse(stored));
    } else {
      setEmbeds(defaultEmbeds);
      localStorage.setItem('embed_manager_items', JSON.stringify(defaultEmbeds));
    }
  }, []);

  const saveEmbeds = (newEmbeds: EmbedItem[]) => {
    setEmbeds(newEmbeds);
    localStorage.setItem('embed_manager_items', JSON.stringify(newEmbeds));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.embedCode) {
      toast.error("Please fill in name and embed code");
      return;
    }

    if (editingEmbed) {
      // Update existing
      const updated = embeds.map(e => 
        e.id === editingEmbed.id 
          ? { ...e, ...formData }
          : e
      );
      saveEmbeds(updated);
      toast.success("Embed updated successfully");
    } else {
      // Add new
      const newEmbed: EmbedItem = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        order: embeds.length + 1
      };
      saveEmbeds([...embeds, newEmbed]);
      toast.success("Embed added successfully");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = embeds.filter(e => e.id !== id);
    saveEmbeds(updated);
    toast.success("Embed removed successfully");
  };

  const handleToggleActive = (id: string) => {
    const updated = embeds.map(e => 
      e.id === id ? { ...e, isActive: !e.isActive } : e
    );
    saveEmbeds(updated);
  };

  const handleEdit = (embed: EmbedItem) => {
    setEditingEmbed(embed);
    setFormData({
      name: embed.name,
      description: embed.description,
      category: embed.category,
      embedCode: embed.embedCode,
      showOnPages: embed.showOnPages,
      isActive: embed.isActive,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingEmbed(null);
    setFormData({
      name: '',
      description: '',
      category: 'custom',
      embedCode: '',
      showOnPages: ['all'],
      isActive: true,
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Embed code copied to clipboard");
  };

  return (
    <AuthGuard>
      <Helmet>
        <title>Embed Manager | Admin</title>
      </Helmet>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Embed Manager</h1>
              <p className="text-muted-foreground mt-1">
                Add and manage custom embed codes, AI agents, and integrations
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="btn-primary gap-2">
                  <Plus className="h-4 w-4" />
                  Add Embed
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEmbed ? 'Edit Embed' : 'Add New Embed'}</DialogTitle>
                  <DialogDescription>
                    Add custom embed codes for AI agents, widgets, analytics, and more
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Lead Capture AI Agent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as EmbedItem['category'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this embed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Embed Code *</Label>
                    <Textarea
                      value={formData.embedCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, embedCode: e.target.value }))}
                      placeholder="<script>...</script> or <iframe>...</iframe>"
                      className="font-mono text-sm min-h-[150px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste your embed code from third-party services (Calendly, Typeform, AI agents, etc.)
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Show on Pages</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'all', label: 'All Pages' },
                        { value: '/', label: 'Home (/)' },
                        { value: '/about', label: 'About' },
                        { value: '/pricing', label: 'Pricing' },
                        { value: '/contact', label: 'Contact' },
                        { value: '/book-call', label: 'Book Call' },
                        { value: '/ai-automation', label: 'AI Automation' },
                        { value: '/ai-lead-engine', label: 'AI Lead Engine' },
                        { value: '/performance-marketing', label: 'Performance Marketing' },
                        { value: '/case-studies', label: 'Case Studies' },
                        { value: '/blog', label: 'Blog' },
                        { value: '/calculator', label: 'Calculator' },
                      ].map((page) => (
                        <label 
                          key={page.value}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                            formData.showOnPages.includes(page.value) || (formData.showOnPages.includes('all') && page.value !== 'all')
                              ? 'bg-primary/10 border-primary/30' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.showOnPages.includes(page.value) || (page.value !== 'all' && formData.showOnPages.includes('all'))}
                            onChange={(e) => {
                              if (page.value === 'all') {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  showOnPages: e.target.checked ? ['all'] : [] 
                                }));
                              } else {
                                setFormData(prev => {
                                  // Remove 'all' if selecting specific pages
                                  let newPages = prev.showOnPages.filter(p => p !== 'all');
                                  if (e.target.checked) {
                                    newPages = [...newPages, page.value];
                                  } else {
                                    newPages = newPages.filter(p => p !== page.value);
                                  }
                                  return { ...prev, showOnPages: newPages.length ? newPages : ['all'] };
                                });
                              }
                            }}
                            className="rounded border-border"
                            disabled={page.value !== 'all' && formData.showOnPages.includes('all')}
                          />
                          <span className="text-sm">{page.label}</span>
                        </label>
                      ))}
                    </div>
                    <Input
                      value={formData.showOnPages.filter(p => !['all', '/', '/about', '/pricing', '/contact', '/book-call', '/ai-automation', '/ai-lead-engine', '/performance-marketing', '/case-studies', '/blog', '/calculator'].includes(p)).join(', ')}
                      onChange={(e) => {
                        const customPages = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        const standardPages = formData.showOnPages.filter(p => ['all', '/', '/about', '/pricing', '/contact', '/book-call', '/ai-automation', '/ai-lead-engine', '/performance-marketing', '/case-studies', '/blog', '/calculator'].includes(p));
                        setFormData(prev => ({ 
                          ...prev, 
                          showOnPages: [...standardPages, ...customPages]
                        }));
                      }}
                      placeholder="Custom pages (comma-separated): /custom-page, /landing/promo"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Select pages or add custom paths. "All Pages" will show on every page.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} className="btn-primary gap-2">
                    <Save className="h-4 w-4" />
                    {editingEmbed ? 'Update' : 'Save'} Embed
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{embeds.length}</p>
                    <p className="text-sm text-muted-foreground">Total Embeds</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Eye className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{embeds.filter(e => e.isActive).length}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Bot className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {embeds.filter(e => e.category === 'ai-agent').length}
                    </p>
                    <p className="text-sm text-muted-foreground">AI Agents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Embeds List */}
          <div className="space-y-4">
            {embeds.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Embeds Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first embed code to get started
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)} className="btn-primary gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Embed
                  </Button>
                </CardContent>
              </Card>
            ) : (
              embeds.map((embed) => {
                const CategoryIcon = categoryIcons[embed.category];
                return (
                  <Card key={embed.id} className={`glass-card transition-all ${!embed.isActive ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="cursor-grab text-muted-foreground">
                          <GripVertical className="h-5 w-5" />
                        </div>
                        
                        <div className={`p-2 rounded-lg ${embed.isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                          <CategoryIcon className={`h-5 w-5 ${embed.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">{embed.name}</h3>
                            <Badge variant={embed.isActive ? "default" : "secondary"} className="text-xs">
                              {embed.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[embed.category]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{embed.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Pages: {embed.showOnPages.join(', ')}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={embed.isActive}
                            onCheckedChange={() => handleToggleActive(embed.id)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewEmbed(embed)}
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(embed.embedCode)}
                            title="Copy Code"
                          >
                            <Code className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(embed)}
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(embed.id)}
                            className="text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Preview Dialog */}
          <Dialog open={!!previewEmbed} onOpenChange={() => setPreviewEmbed(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Preview: {previewEmbed?.name}</DialogTitle>
                <DialogDescription>
                  This is how the embed code looks
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-xs text-muted-foreground mb-2 block">Embed Code:</Label>
                  <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                    {previewEmbed?.embedCode}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(previewEmbed?.embedCode || '')}
                    className="flex-1 gap-2"
                  >
                    <Code className="h-4 w-4" />
                    Copy Embed Code
                  </Button>
                  <Button variant="outline" onClick={() => setPreviewEmbed(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Instructions */}
          <Card className="mt-8 glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                How to Use Embed Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Adding AI Agents</h4>
                  <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                    <li>Get embed code from your AI agent provider (e.g., Voiceflow, Botpress, Dialogflow)</li>
                    <li>Click "Add Embed" and paste the code</li>
                    <li>Select "AI Agent" as category</li>
                    <li>Choose which pages to show it on</li>
                    <li>Save and activate!</li>
                  </ol>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Managing Visibility</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Toggle Active/Inactive to show/hide embeds</li>
                    <li>Specify pages: "/book-call, /contact" or "all"</li>
                    <li>Drag to reorder priority</li>
                    <li>Preview before activating</li>
                  </ul>
                </div>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm">
                  <strong>Pro Tip:</strong> For AI automation agents, copy the embed code from services like Voiceflow, Botpress, 
                  Chatbase, or any custom AI agent builder. The embed will automatically appear on your selected pages.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </SidebarProvider>
    </AuthGuard>
  );
}