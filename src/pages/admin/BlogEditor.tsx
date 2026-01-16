import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { Helmet } from "react-helmet-async";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import {
    Bold, Italic, Strikethrough, List, ListOrdered, Quote,
    Image as ImageIcon, Youtube as YoutubeIcon, Link as LinkIcon,
    Heading1, Heading2, Undo, Redo, Save, Send, Loader2, ArrowLeft
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function BlogEditor() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("id");
    const { toast } = useToast();

    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [category, setCategory] = useState("AI Automation");
    const [coverImage, setCoverImage] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(!!editId);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ inline: false, allowBase64: false }),
            Link.configure({ openOnClick: false }),
            Youtube.configure({ width: 640, height: 360 }),
            Placeholder.configure({ placeholder: "Start writing your amazing article..." }),
        ],
        content: "",
        editorProps: {
            attributes: {
                class: "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4",
            },
        },
    });

    useEffect(() => {
        if (editId && editor) {
            const loadPost = async () => {
                try {
                    const token = localStorage.getItem("admin_token");
                    // Fetch single post directly by ID to get full content
                    const res = await fetch(`${API_BASE_URL}/blog/posts.php?id=${editId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!res.ok) throw new Error("Failed to load post");

                    const post = await res.json();

                    if (post) {
                        setTitle(post.title || "");
                        setExcerpt(post.excerpt || "");
                        setCategory(post.category || "AI Automation");
                        setCoverImage(post.cover_image || "");
                        // Use setTimeout to ensure editor is fully mounted
                        setTimeout(() => {
                            editor?.commands.setContent(post.content || "");
                        }, 100);
                    }
                } catch (e) {
                    toast({ title: "Failed to load post", variant: "destructive" });
                } finally {
                    setLoading(false);
                }
            };
            loadPost();
        }
    }, [editId, editor]);

    const handleSave = async (publishStatus: "draft" | "published") => {
        if (!title.trim()) {
            toast({ title: "Title is required", variant: "destructive" });
            return;
        }
        if (!editor?.getHTML()) {
            toast({ title: "Content is required", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem("admin_token");
            const url = editId
                ? `${API_BASE_URL}/blog/posts.php?id=${editId}`
                : `${API_BASE_URL}/blog/posts.php`;

            const res = await fetch(url, {
                method: editId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    content: editor?.getHTML(),
                    excerpt,
                    category,
                    cover_image: coverImage,
                    status: publishStatus,
                }),
            });

            const data = await res.json();
            if (data.success) {
                toast({
                    title: publishStatus === "published" ? "Published!" : "Draft Saved!",
                    description: editId ? "Post updated" : "Post created",
                });
                navigate("/admin/blog");
            } else {
                throw new Error(data.error || "Failed to save");
            }
        } catch (e: any) {
            toast({ title: e.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = useCallback(async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e: any) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setUploading(true);
            try {
                const formData = new FormData();
                formData.append("image", file);

                const token = localStorage.getItem("admin_token");
                const res = await fetch(`${API_BASE_URL}/blog/upload.php`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                const data = await res.json();
                if (data.success && data.url) {
                    editor?.chain().focus().setImage({ src: data.url }).run();
                    toast({ title: "Image uploaded!" });
                } else {
                    throw new Error(data.error || "Upload failed");
                }
            } catch (e: any) {
                toast({ title: e.message, variant: "destructive" });
            } finally {
                setUploading(false);
            }
        };
        input.click();
    }, [editor, toast]);

    const handleYoutubeEmbed = useCallback(() => {
        const url = prompt("Enter YouTube video URL:");
        if (url) {
            editor?.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    }, [editor]);

    const handleLinkAdd = useCallback(() => {
        const url = prompt("Enter URL:");
        if (url) {
            editor?.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    return (
        <>
            <Helmet>
                <title>{editId ? "Edit Post" : "New Post"} | HireMediaMind Admin</title>
            </Helmet>

            <SidebarProvider>
                <div className="min-h-screen flex w-full bg-background">
                    <AdminSidebar />

                    <main className="flex-1 p-6 lg:p-8">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <div className="max-w-5xl mx-auto">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <Button variant="ghost" onClick={() => navigate("/admin/blog")}>
                                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Posts
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving}>
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                            Save Draft
                                        </Button>
                                        <Button onClick={() => handleSave("published")} disabled={saving}>
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                            Publish
                                        </Button>
                                    </div>
                                </div>

                                {/* Title */}
                                <Input
                                    placeholder="Enter your title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-3xl font-bold h-16 border-0 border-b rounded-none focus-visible:ring-0 mb-4"
                                />

                                {/* Metadata Row */}
                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <Label>Category</Label>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="AI Automation">AI Automation</SelectItem>
                                                <SelectItem value="Performance Marketing">Performance Marketing</SelectItem>
                                                <SelectItem value="Case Study">Case Study</SelectItem>
                                                <SelectItem value="News">News</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Cover Image URL</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="https://..."
                                                value={coverImage}
                                                onChange={(e) => setCoverImage(e.target.value)}
                                            />
                                            <Button variant="outline" onClick={handleImageUpload} disabled={uploading}>
                                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Excerpt */}
                                <div className="mb-6">
                                    <Label>Excerpt (Short Summary)</Label>
                                    <Textarea
                                        placeholder="A brief 1-2 sentence summary..."
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                {/* Toolbar */}
                                <div className="flex flex-wrap gap-1 p-2 border rounded-t-lg bg-muted/50 sticky top-0 z-10">
                                    <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive("bold") ? "bg-muted" : ""}>
                                        <Bold className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive("italic") ? "bg-muted" : ""}>
                                        <Italic className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleStrike().run()}>
                                        <Strikethrough className="h-4 w-4" />
                                    </Button>
                                    <div className="w-px bg-border mx-1" />
                                    <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
                                        <Heading1 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
                                        <Heading2 className="h-4 w-4" />
                                    </Button>
                                    <div className="w-px bg-border mx-1" />
                                    <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
                                        <ListOrdered className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
                                        <Quote className="h-4 w-4" />
                                    </Button>
                                    <div className="w-px bg-border mx-1" />
                                    <Button variant="ghost" size="icon" onClick={handleImageUpload} disabled={uploading}>
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={handleYoutubeEmbed}>
                                        <YoutubeIcon className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={handleLinkAdd}>
                                        <LinkIcon className="h-4 w-4" />
                                    </Button>
                                    <div className="flex-1" />
                                    <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().undo().run()}>
                                        <Undo className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => editor?.chain().focus().redo().run()}>
                                        <Redo className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Editor */}
                                <div className="border border-t-0 rounded-b-lg bg-background min-h-[500px]">
                                    <EditorContent editor={editor} />
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </SidebarProvider>
        </>
    );
}
