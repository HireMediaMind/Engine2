import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { Plus, Edit, Trash2, Eye, Loader2, FileText } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    status: "draft" | "published";
    created_at: string;
}

export default function BlogList() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE_URL}/blog/posts.php?admin=1`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch (e) {
            toast({ title: "Failed to load posts", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id: number) => {
        setDeleting(id);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE_URL}/blog/posts.php?id=${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Post deleted" });
                setPosts(posts.filter((p) => p.id !== id));
            } else {
                throw new Error(data.error);
            }
        } catch (e: any) {
            toast({ title: e.message, variant: "destructive" });
        } finally {
            setDeleting(null);
        }
    };

    return (
        <>
            <Helmet>
                <title>Blog Posts | HireMediaMind Admin</title>
            </Helmet>

            <SidebarProvider>
                <div className="min-h-screen flex w-full bg-background">
                    <AdminSidebar />

                    <main className="flex-1 p-6 lg:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Blog Posts</h1>
                                <p className="text-muted-foreground mt-1">Manage your articles</p>
                            </div>
                            <Button onClick={() => navigate("/admin/blog-editor")}>
                                <Plus className="h-4 w-4 mr-2" /> New Post
                            </Button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-16 border rounded-lg bg-muted/30">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                                <p className="text-muted-foreground mb-4">Create your first blog post</p>
                                <Button onClick={() => navigate("/admin/blog-editor")}>
                                    <Plus className="h-4 w-4 mr-2" /> Create Post
                                </Button>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {posts.map((post) => (
                                            <TableRow key={post.id}>
                                                <TableCell className="font-medium max-w-[300px] truncate">
                                                    {post.title}
                                                </TableCell>
                                                <TableCell>{post.category}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`px-2 py-1 text-xs rounded-full ${post.status === "published"
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                                            }`}
                                                    >
                                                        {post.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {post.status === "published" && (
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <a href={`/blog/${post.slug}`} target="_blank" rel="noopener">
                                                                    <Eye className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => navigate(`/admin/blog-editor?id=${post.id}`)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-destructive">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently delete "{post.title}".
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(post.id)}
                                                                        className="bg-destructive text-destructive-foreground"
                                                                    >
                                                                        {deleting === post.id ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            "Delete"
                                                                        )}
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </main>
                </div>
            </SidebarProvider>
        </>
    );
}
