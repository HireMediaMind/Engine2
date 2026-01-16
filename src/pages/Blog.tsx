import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Download, Calculator, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { API_BASE_URL } from "@/lib/api";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  cover_image: string;
  created_at: string;
}

const freeTools = [
  {
    icon: Calculator,
    title: "ROAS Calculator",
    description: "Calculate return on ad spend and see projected results.",
    link: "/calculator",
    type: "tool",
  },
  {
    icon: FileText,
    title: "Landing Page Checklist",
    description: "47-point checklist to optimize your landing pages.",
    link: "#",
    type: "download",
  },
  {
    icon: Download,
    title: "Ad Creative Templates",
    description: "Proven ad templates for Meta and Google.",
    link: "#",
    type: "download",
  },
];

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/blog/posts.php`);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load posts:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <>
      <Helmet>
        <title>Blog & Resources - HireMediaMind | Marketing & Automation Tips</title>
        <meta
          name="description"
          content="Free resources, guides, and tools for performance marketing and AI automation."
        />
        <link rel="canonical" href="https://www.hiremediamind.com/blog" />
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="gradient-hero-bg py-16">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <p className="section-label">Resources</p>
                <h1 className="section-title text-3xl md:text-4xl">Blog & Free Tools</h1>
                <p className="section-subtitle mx-auto">
                  Actionable insights on performance marketing and AI automation.
                </p>
              </div>
            </div>
          </section>

          {/* Free Tools Section */}
          <section className="border-t border-border bg-background py-16">
            <div className="mx-auto max-w-6xl px-4">
              <h2 className="text-2xl font-bold text-foreground mb-8">Free Tools</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {freeTools.map((tool) => (
                  <div
                    key={tool.title}
                    className="rounded-3xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/30"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <tool.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                    {tool.type === "tool" ? (
                      <Link
                        to={tool.link}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        Use Tool <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => alert("Coming soon!")}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        Download Free <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Blog Posts */}
          <section className="border-t border-border gradient-hero-bg py-16">
            <div className="mx-auto max-w-6xl px-4">
              <h2 className="text-2xl font-bold text-foreground mb-8">Latest Articles</h2>

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No articles yet. Check back soon!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="block group">
                      <article className="h-full rounded-3xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                        <div className="aspect-video bg-gradient-to-br from-primary/10 to-teal/10 flex items-center justify-center overflow-hidden">
                          {post.cover_image ? (
                            <img
                              src={post.cover_image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <FileText className="h-12 w-12 text-primary/30" />
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                              {post.category}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(post.created_at)}
                          </span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              <div className="text-center mt-12">
                <Link to="/book-call" className="btn-primary inline-flex items-center gap-2">
                  Get Personalized Advice <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Blog;
