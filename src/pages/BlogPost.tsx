import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Loader2, Share2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { API_BASE_URL } from "@/lib/api";

interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: string;
    cover_image: string;
    author: string;
    created_at: string;
}

const BlogPost = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/blog/posts.php?slug=${slug}`);
                if (!res.ok) throw new Error("Not found");
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setPost(data);
            } catch (e) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchPost();
    }, [slug]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}>
                    <Loader2 className="h-12 w-12 text-primary" />
                </motion.div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
                    <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
                    <Button asChild variant="outline"><Link to="/blog">Return to Blog</Link></Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{post.title} - HireMediaMind</title>
                <meta name="description" content={post.excerpt} />
            </Helmet>

            {/* Reading Progress Bar */}
            <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-primary origin-left z-50" style={{ scaleX }} />

            <div className="flex min-h-screen flex-col bg-background">
                <Header />

                <main className="flex-1">
                    {/* Hero Section */}
                    <section className="relative pt-24 pb-20 overflow-hidden">
                        <div className="absolute inset-0 -z-10">
                            <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                            <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                        </div>

                        <div className="mx-auto max-w-4xl px-6 relative">
                            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors group">
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Articles
                            </Link>

                            <div className="flex flex-col items-center text-center">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                    <span className="bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full mb-6 inline-block">
                                        {post.category}
                                    </span>
                                </motion.div>

                                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-8 leading-[1.1]">
                                    {post.title}
                                </motion.h1>

                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground border-b border-border/50 pb-10 w-full">
                                    <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> {post.author}</div>
                                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {formatDate(post.created_at)}</div>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* Featured Image */}
                    {post.cover_image && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="mx-auto max-w-5xl px-4 sm:px-6 mb-16">
                            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50">
                                <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                        </motion.div>
                    )}

                    {/* Article Content - Render HTML */}
                    <article className="mx-auto max-w-3xl px-6 pb-24">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="prose prose-lg md:prose-xl dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-2xl prose-img:shadow-lg" dangerouslySetInnerHTML={{ __html: post.content }} />

                        {/* Share */}
                        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
                            <span className="text-sm font-semibold text-muted-foreground">Share this article:</span>
                            <Button variant="ghost" size="icon" className="rounded-full"><Share2 className="h-5 w-5" /></Button>
                        </div>
                    </article>

                    {/* CTA */}
                    <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Need results like this?</h2>
                            <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                                Let our AI systems handle your leads while you focus on closing deals.
                            </p>
                            <Button size="lg" variant="secondary" className="rounded-full h-14 px-8 text-lg font-semibold" asChild>
                                <Link to="/book-call">Book Free Strategy Call</Link>
                            </Button>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default BlogPost;
