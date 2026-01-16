import { useState } from "react";
import { X, ExternalLink, Info, AlertTriangle, CheckCircle, Tag, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { useAnnouncementsHostinger, type Announcement } from "@/hooks/useAnnouncementsHostinger";

const typeStyles: Record<Announcement['announcement_type'], { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  info: {
    bg: "bg-secondary/10 border-secondary/30",
    text: "text-secondary",
    icon: Info,
  },
  success: {
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle,
  },
  warning: {
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    icon: AlertTriangle,
  },
  promo: {
    bg: "bg-primary/10 border-primary/30",
    text: "text-primary",
    icon: Tag,
  },
  maintenance: {
    bg: "bg-muted border-border",
    text: "text-muted-foreground",
    icon: Wrench,
  },
};

export const AnnouncementBar = () => {
  const { data: announcements, isLoading } = useAnnouncementsHostinger();
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  if (isLoading || !announcements?.length) return null;

  // Show only non-dismissed announcements
  const visibleAnnouncements = announcements.filter((a) => !dismissed.has(a.id));
  
  if (!visibleAnnouncements.length) return null;

  // Show only the highest priority announcement
  const announcement = visibleAnnouncements[0];
  const style = typeStyles[announcement.announcement_type] || typeStyles.info;
  const Icon = style.icon;

  const handleDismiss = (id: number) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const isExternalLink = announcement.cta_link?.startsWith("http");

  return (
    <div
      className={`relative w-full border-b ${style.bg} animate-fade-in`}
      role="banner"
      aria-label="Announcement"
    >
      <div className="mx-auto max-w-7xl px-4 py-2.5">
        <div className="flex items-center justify-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            {announcement.icon ? (
              <span className="text-base">{announcement.icon}</span>
            ) : (
              <Icon className={`h-4 w-4 ${style.text}`} />
            )}
            <span className={`font-medium ${style.text}`}>
              {announcement.title}
            </span>
          </div>
          <span className="hidden sm:inline text-foreground/80">
            {announcement.message}
          </span>
          <span className="sm:hidden text-foreground/80">
            {announcement.message.length > 50
              ? announcement.message.slice(0, 50) + "..."
              : announcement.message}
          </span>
          {announcement.cta_text && announcement.cta_link && (
            <>
              {isExternalLink ? (
                <a
                  href={announcement.cta_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline ${style.text}`}
                >
                  {announcement.cta_text}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <Link
                  to={announcement.cta_link}
                  className={`font-semibold underline-offset-4 hover:underline ${style.text}`}
                >
                  {announcement.cta_text}
                </Link>
              )}
            </>
          )}
        </div>
        <button
          onClick={() => handleDismiss(announcement.id)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-foreground/10 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4 text-foreground/60" />
        </button>
      </div>
    </div>
  );
};