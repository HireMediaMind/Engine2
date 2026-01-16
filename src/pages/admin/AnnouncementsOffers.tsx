import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  useAllAnnouncementsHostinger,
  useCreateAnnouncementHostinger,
  useUpdateAnnouncementHostinger,
  useDeleteAnnouncementHostinger,
  type Announcement,
} from "@/hooks/useAnnouncementsHostinger";
import {
  useAllOffers,
  useCreateOffer,
  useUpdateOffer,
  useDeleteOffer,
  Offer,
} from "@/hooks/useOffers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Megaphone, Tag, Eye, EyeOff } from "lucide-react";
import AuthGuard from "@/components/admin/AuthGuard";

const pageOptions = [
  { value: "all", label: "All Pages" },
  { value: "home", label: "Home" },
  { value: "pricing", label: "Pricing" },
  { value: "ai-automation", label: "AI Automation" },
  { value: "performance-marketing", label: "Performance Marketing" },
];

const planOptions = [
  { value: "all", label: "All Plans" },
  { value: "starter", label: "Starter" },
  { value: "growth", label: "Growth" },
  { value: "premium", label: "Premium" },
  { value: "pro", label: "Pro" },
  { value: "scale", label: "Scale" },
];

const announcementTypes = [
  { value: "info", label: "Info", color: "bg-secondary" },
  { value: "success", label: "Success", color: "bg-emerald-500" },
  { value: "warning", label: "Warning", color: "bg-amber-500" },
  { value: "promo", label: "Promotional", color: "bg-primary" },
  { value: "maintenance", label: "Maintenance", color: "bg-muted" },
];

const discountTypes = [
  { value: "percentage", label: "Percentage Off" },
  { value: "flat", label: "Flat Discount" },
  { value: "message_only", label: "Message Only (No Discount)" },
];

const AnnouncementsOffers = () => {
  const { toast } = useToast();
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Announcements hooks (Hostinger PHP)
  const { data: announcements, isLoading: loadingAnnouncements, refetch: refetchAnnouncements } = useAllAnnouncementsHostinger();
  const createAnnouncement = useCreateAnnouncementHostinger();
  const updateAnnouncement = useUpdateAnnouncementHostinger();
  const deleteAnnouncement = useDeleteAnnouncementHostinger();

  // Offers hooks (Supabase - kept for offers which are separate)
  const { data: offers, isLoading: loadingOffers } = useAllOffers();
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const deleteOffer = useDeleteOffer();

  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState({
    enabled: true,
    announcement_type: "info" as Announcement['announcement_type'],
    title: "",
    message: "",
    cta_text: "",
    cta_link: "",
    icon: "",
    start_date: "",
    end_date: "",
    target_pages: ["all"] as string[],
    priority: 0,
  });

  // Offer form state
  const [offerForm, setOfferForm] = useState({
    enabled: false,
    title: "",
    description: "",
    discount_type: "percentage" as Offer['discount_type'],
    discount_value: 0,
    target_pages: ["all"] as string[],
    target_plans: ["all"] as string[],
    start_date: "",
    end_date: "",
    badge_text: "OFFER",
  });

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      enabled: true,
      announcement_type: "info",
      title: "",
      message: "",
      cta_text: "",
      cta_link: "",
      icon: "",
      start_date: "",
      end_date: "",
      target_pages: ["all"],
      priority: 0,
    });
    setEditingAnnouncement(null);
  };

  const resetOfferForm = () => {
    setOfferForm({
      enabled: false,
      title: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      target_pages: ["all"],
      target_plans: ["all"],
      start_date: "",
      end_date: "",
      badge_text: "OFFER",
    });
    setEditingOffer(null);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      enabled: announcement.enabled,
      announcement_type: announcement.announcement_type,
      title: announcement.title,
      message: announcement.message,
      cta_text: announcement.cta_text || "",
      cta_link: announcement.cta_link || "",
      icon: announcement.icon || "",
      start_date: announcement.start_date ? announcement.start_date.slice(0, 16) : "",
      end_date: announcement.end_date ? announcement.end_date.slice(0, 16) : "",
      target_pages: announcement.target_pages || ["all"],
      priority: announcement.priority,
    });
    setAnnouncementDialogOpen(true);
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferForm({
      enabled: offer.enabled,
      title: offer.title,
      description: offer.description || "",
      discount_type: offer.discount_type,
      discount_value: offer.discount_value,
      target_pages: offer.target_pages || ["all"],
      target_plans: offer.target_plans || ["all"],
      start_date: offer.start_date ? offer.start_date.slice(0, 16) : "",
      end_date: offer.end_date ? offer.end_date.slice(0, 16) : "",
      badge_text: offer.badge_text || "OFFER",
    });
    setOfferDialogOpen(true);
  };

  const handleSaveAnnouncement = async () => {
    try {
      const data = {
        ...announcementForm,
        start_date: announcementForm.start_date || null,
        end_date: announcementForm.end_date || null,
        cta_text: announcementForm.cta_text || null,
        cta_link: announcementForm.cta_link || null,
        icon: announcementForm.icon || null,
      };

      if (editingAnnouncement) {
        await updateAnnouncement.mutateAsync({ id: editingAnnouncement.id, ...data });
        toast({ title: "Announcement updated" });
      } else {
        await createAnnouncement.mutateAsync(data);
        toast({ title: "Announcement created" });
      }
      setAnnouncementDialogOpen(false);
      resetAnnouncementForm();
      refetchAnnouncements();
    } catch (error: any) {
      toast({ title: "Error saving announcement", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveOffer = async () => {
    try {
      const data = {
        ...offerForm,
        start_date: offerForm.start_date || null,
        end_date: offerForm.end_date || null,
        description: offerForm.description || null,
      };

      if (editingOffer) {
        await updateOffer.mutateAsync({ id: editingOffer.id, ...data });
        toast({ title: "Offer updated" });
      } else {
        await createOffer.mutateAsync(data);
        toast({ title: "Offer created" });
      }
      setOfferDialogOpen(false);
      resetOfferForm();
    } catch (error) {
      toast({ title: "Error saving offer", variant: "destructive" });
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      await deleteAnnouncement.mutateAsync(id);
      toast({ title: "Announcement deleted" });
      refetchAnnouncements();
    } catch (error: any) {
      toast({ title: "Error deleting announcement", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      await deleteOffer.mutateAsync(id);
      toast({ title: "Offer deleted" });
    } catch (error) {
      toast({ title: "Error deleting offer", variant: "destructive" });
    }
  };

  const toggleAnnouncementEnabled = async (announcement: Announcement) => {
    try {
      await updateAnnouncement.mutateAsync({
        id: announcement.id,
        enabled: !announcement.enabled,
      });
      toast({ title: announcement.enabled ? "Announcement disabled" : "Announcement enabled" });
      refetchAnnouncements();
    } catch (error: any) {
      toast({ title: "Error updating announcement", description: error.message, variant: "destructive" });
    }
  };

  const toggleOfferEnabled = async (offer: Offer) => {
    try {
      await updateOffer.mutateAsync({
        id: offer.id,
        enabled: !offer.enabled,
      });
      toast({ title: offer.enabled ? "Offer disabled" : "Offer enabled" });
    } catch (error) {
      toast({ title: "Error updating offer", variant: "destructive" });
    }
  };

  const handlePageToggle = (value: string, currentPages: string[], setter: (pages: string[]) => void) => {
    if (value === "all") {
      setter(["all"]);
    } else {
      const withoutAll = currentPages.filter((p) => p !== "all");
      if (currentPages.includes(value)) {
        const newPages = withoutAll.filter((p) => p !== value);
        setter(newPages.length ? newPages : ["all"]);
      } else {
        setter([...withoutAll, value]);
      }
    }
  };

  return (
    <AuthGuard>
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Announcements & Offers</h1>
          <p className="text-muted-foreground mt-1">
            Manage global announcements, banners, and pricing discounts
          </p>
        </div>

        <Tabs defaultValue="announcements" className="space-y-6">
          <TabsList>
            <TabsTrigger value="announcements" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="offers" className="gap-2">
              <Tag className="h-4 w-4" />
              Offers & Discounts
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Create and manage announcement banners displayed at the top of your site.
              </p>
              <Dialog open={announcementDialogOpen} onOpenChange={(open) => {
                setAnnouncementDialogOpen(open);
                if (!open) resetAnnouncementForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
                    </DialogTitle>
                    <DialogDescription>
                      Configure your announcement banner settings
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enabled">Enable Announcement</Label>
                      <Switch
                        id="enabled"
                        checked={announcementForm.enabled}
                        onCheckedChange={(checked) =>
                          setAnnouncementForm((f) => ({ ...f, enabled: checked }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Type</Label>
                      <Select
                        value={announcementForm.announcement_type}
                        onValueChange={(value: Announcement['announcement_type']) =>
                          setAnnouncementForm((f) => ({ ...f, announcement_type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {announcementTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${type.color}`} />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Title</Label>
                      <Input
                        value={announcementForm.title}
                        onChange={(e) =>
                          setAnnouncementForm((f) => ({ ...f, title: e.target.value }))
                        }
                        placeholder="🎉 New Feature"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Message</Label>
                      <Textarea
                        value={announcementForm.message}
                        onChange={(e) =>
                          setAnnouncementForm((f) => ({ ...f, message: e.target.value }))
                        }
                        placeholder="We've just launched something exciting!"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>CTA Text (Optional)</Label>
                        <Input
                          value={announcementForm.cta_text}
                          onChange={(e) =>
                            setAnnouncementForm((f) => ({ ...f, cta_text: e.target.value }))
                          }
                          placeholder="Learn More"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>CTA Link (Optional)</Label>
                        <Input
                          value={announcementForm.cta_link}
                          onChange={(e) =>
                            setAnnouncementForm((f) => ({ ...f, cta_link: e.target.value }))
                          }
                          placeholder="/pricing or https://..."
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Priority (0-100)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={announcementForm.priority}
                        onChange={(e) =>
                          setAnnouncementForm((f) => ({ ...f, priority: parseInt(e.target.value) || 0 }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Start Date (Optional)</Label>
                        <Input
                          type="datetime-local"
                          value={announcementForm.start_date}
                          onChange={(e) =>
                            setAnnouncementForm((f) => ({ ...f, start_date: e.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>End Date (Optional)</Label>
                        <Input
                          type="datetime-local"
                          value={announcementForm.end_date}
                          onChange={(e) =>
                            setAnnouncementForm((f) => ({ ...f, end_date: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Show on Pages</Label>
                      <div className="flex flex-wrap gap-2">
                        {pageOptions.map((page) => (
                          <label
                            key={page.value}
                            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer hover:bg-muted/50"
                          >
                            <Checkbox
                              checked={announcementForm.target_pages.includes(page.value)}
                              onCheckedChange={() =>
                                handlePageToggle(
                                  page.value,
                                  announcementForm.target_pages,
                                  (pages) => setAnnouncementForm((f) => ({ ...f, target_pages: pages }))
                                )
                              }
                            />
                            <span className="text-sm">{page.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveAnnouncement} disabled={createAnnouncement.isPending || updateAnnouncement.isPending}>
                      {editingAnnouncement ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {loadingAnnouncements ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : !announcements?.length ? (
                <Card className="p-8 text-center">
                  <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No Announcements</h3>
                  <p className="text-muted-foreground mb-4">Create your first announcement banner</p>
                  <Button onClick={() => setAnnouncementDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Announcement
                  </Button>
                </Card>
              ) : (
                announcements.map((announcement) => (
                  <Card key={announcement.id} className={!announcement.enabled ? 'opacity-60' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={announcement.enabled ? 'default' : 'secondary'}>
                            {announcement.announcement_type}
                          </Badge>
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleAnnouncementEnabled(announcement)}
                          >
                            {announcement.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditAnnouncement(announcement)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{announcement.message}</p>
                      {announcement.cta_text && (
                        <p className="text-sm mt-2">
                          CTA: <span className="font-medium">{announcement.cta_text}</span>
                          {announcement.cta_link && ` → ${announcement.cta_link}`}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Offers Tab - keeping Supabase for now */}
          <TabsContent value="offers" className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Manage pricing discounts and promotional offers.
              </p>
              <Dialog open={offerDialogOpen} onOpenChange={(open) => {
                setOfferDialogOpen(open);
                if (!open) resetOfferForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Offer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingOffer ? "Edit Offer" : "Create Offer"}
                    </DialogTitle>
                    <DialogDescription>
                      Configure discount and promotional offer settings
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Offer</Label>
                      <Switch
                        checked={offerForm.enabled}
                        onCheckedChange={(checked) => setOfferForm((f) => ({ ...f, enabled: checked }))}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Title</Label>
                      <Input
                        value={offerForm.title}
                        onChange={(e) => setOfferForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="Holiday Special"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        value={offerForm.description}
                        onChange={(e) => setOfferForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Limited time offer..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Discount Type</Label>
                        <Select
                          value={offerForm.discount_type}
                          onValueChange={(value: Offer['discount_type']) =>
                            setOfferForm((f) => ({ ...f, discount_type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {discountTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Discount Value</Label>
                        <Input
                          type="number"
                          value={offerForm.discount_value}
                          onChange={(e) =>
                            setOfferForm((f) => ({ ...f, discount_value: parseFloat(e.target.value) || 0 }))
                          }
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Badge Text</Label>
                      <Input
                        value={offerForm.badge_text}
                        onChange={(e) => setOfferForm((f) => ({ ...f, badge_text: e.target.value }))}
                        placeholder="OFFER"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOfferDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveOffer} disabled={createOffer.isPending || updateOffer.isPending}>
                      {editingOffer ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Offers List */}
            <div className="space-y-4">
              {loadingOffers ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : !offers?.length ? (
                <Card className="p-8 text-center">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No Offers</h3>
                  <p className="text-muted-foreground mb-4">Create your first discount offer</p>
                  <Button onClick={() => setOfferDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Offer
                  </Button>
                </Card>
              ) : (
                offers.map((offer) => (
                  <Card key={offer.id} className={!offer.enabled ? 'opacity-60' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={offer.enabled ? 'default' : 'secondary'}>
                            {offer.badge_text}
                          </Badge>
                          <CardTitle className="text-lg">{offer.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleOfferEnabled(offer)}
                          >
                            {offer.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditOffer(offer)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteOffer(offer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{offer.description}</p>
                      <p className="text-sm mt-2">
                        {offer.discount_type === 'percentage' && `${offer.discount_value}% off`}
                        {offer.discount_type === 'flat' && `$${offer.discount_value} off`}
                        {offer.discount_type === 'message_only' && 'Message only (no discount)'}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      </div>
    </SidebarProvider>
    </AuthGuard>
  );
};

export default AnnouncementsOffers;
