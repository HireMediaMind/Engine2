import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Copy, Check, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const BlogGuide = () => {
    const { toast } = useToast();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard!" });
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 py-16">
                <div className="mx-auto max-w-4xl px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">How to Write "Wow" Blog Posts</h1>
                        <p className="text-muted-foreground text-lg">A simple guide to adding visuals and formatting for Admin.</p>
                    </div>

                    <div className="space-y-12">
                        {/* Section 1: Images */}
                        <section className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold">1. Adding Images (The "Visual" Part)</h2>
                            </div>

                            <p className="mb-4">To add an image inside your article text, copy-paste this code:</p>

                            <div className="bg-muted p-4 rounded-xl relative group mb-6">
                                <code className="text-sm font-mono text-primary">![Image Description](https://link-to-your-image.jpg)</code>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => copyToClipboard("![Description](LINK)")}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
                                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Pro Tip: Where to get links?</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-blue-600 dark:text-blue-400">
                                    <li>Right-click any image on Google &gt; "Copy Image Address"</li>
                                    <li>Use <a href="https://unsplash.com" target="_blank" className="underline">Unsplash.com</a> for high quality photos.</li>
                                    <li>Upload your own image to a free host like Imgur.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 2: Structure */}
                        <section className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-purple-600" />
                                </div>
                                <h2 className="text-2xl font-bold">2. Structure & Headings</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-2">Main Heading</h3>
                                    <div className="bg-muted p-3 rounded-lg font-mono text-sm">## Your Heading Here</div>
                                    <p className="text-xs text-muted-foreground mt-1">Use double hash (##) for section titles.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Bold Text</h3>
                                    <div className="bg-muted p-3 rounded-lg font-mono text-sm">**Important Text**</div>
                                    <p className="text-xs text-muted-foreground mt-1">Use double stars (**) for bold.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Upload Process */}
                        <section className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold">3. How to Upload</h2>
                            </div>
                            <ol className="list-decimal list-inside space-y-4 text-muted-foreground">
                                <li>Write your article in Notepad. Save as <strong>filename.md</strong>.</li>
                                <li>Put the file in <code>public/content/blog/</code>.</li>
                                <li>Open <code>src/data/blog-posts.ts</code> and register the post.</li>
                                <li>Run <code>npm run build</code> and upload to Hostinger.</li>
                            </ol>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BlogGuide;
