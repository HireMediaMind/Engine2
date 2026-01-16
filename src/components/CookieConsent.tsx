import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ConsentValue = "accepted";

const STORAGE_KEY = "cookie_consent_v1";

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  const hasConsent = useMemo(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "accepted";
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!hasConsent) setOpen(true);
  }, [hasConsent]);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted" satisfies ConsentValue);
    } catch {
      // ignore
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <Card className="mx-auto flex max-w-3xl flex-col gap-3 border-border/60 bg-background/80 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">We use cookies</p>
          <p className="text-sm text-muted-foreground">
            We use cookies to improve your experience and analyze traffic. By
            clicking Accept, you consent to our cookie policy.
          </p>
        </div>
        <div className="flex gap-2 md:flex-shrink-0">
          <Button onClick={accept}>Accept</Button>
        </div>
      </Card>
    </div>
  );
}
