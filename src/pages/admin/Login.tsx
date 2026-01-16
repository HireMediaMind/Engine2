import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { loginAdmin, signupAdmin, checkAdminSession } from "@/lib/hostinger-auth";

const authSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

const Login = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await checkAdminSession();
        if (session.authenticated && session.user) {
          navigate("/admin");
        }
      } finally {
        setIsCheckingSession(false);
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast({
        title: "Invalid details",
        description: "Enter a valid email and a password (min 8 characters).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        const response = await signupAdmin(parsed.data.email, parsed.data.password);

        if (!response.success) {
          toast({
            title: "Sign up failed",
            description: response.error || "Could not create account",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Account created!",
          description: response.message || "You are now logged in as admin.",
        });

        navigate("/admin");
        return;
      }

      // Login
      const response = await loginAdmin(parsed.data.email, parsed.data.password);

      if (!response.success) {
        toast({
          title: "Login failed",
          description: response.error || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: `Logged in as ${response.user?.display_name || response.user?.email}`,
      });

      navigate("/admin");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Login | HireMediaMind</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-border/50 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
              <CardDescription className="mt-2">
                {mode === "login"
                  ? "Sign in to manage your HireMediaMind dashboard"
                  : "Create your admin account"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@hiremediamind.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    minLength={8}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating..."}
                  </span>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center text-sm">
                {mode === "login" ? (
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setMode("signup")}
                  >
                    Create admin account
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setMode("login")}
                  >
                    Back to sign in
                  </button>
                )}
              </div>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Protected area. Unauthorized access is prohibited.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Login;
