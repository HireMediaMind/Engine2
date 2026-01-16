import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAdminSession, logoutAdmin, type AdminUser } from "@/lib/hostinger-auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      const session = await checkAdminSession();

      if (!mounted) return;

      // If PHP isn't available (preview), show login screen (not a redirect loop)
      if (session.error && session.error.toLowerCase().includes("php")) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      if (!session.authenticated || !session.user) {
        setIsAuthenticated(false);
        setUser(null);
        navigate("/admin/login");
        return;
      }

      setIsAuthenticated(true);
      setUser(session.user);
    };

    verifySession();

    // Re-check session every 5 minutes
    const interval = setInterval(verifySession, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [navigate]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
