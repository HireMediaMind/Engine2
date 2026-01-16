import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Rocket, Bot, Search, BarChart3, Layout, FileText, Globe } from "lucide-react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface NavItem {
  title: string;
  href?: string;
  children?: {
    title: string;
    href: string;
    description: string;
    icon: React.ElementType;
  }[];
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  // Dynamic Navigation Items
  const navItems: NavItem[] = [
    {
      title: t('nav.services'),
      children: [
        {
          title: t('nav.perfMarketing'),
          href: "/services/performance-marketing",
          description: "Meta & Google Ads that scale",
          icon: Rocket
        },
        {
          title: t('nav.aiAutomation'),
          href: "/services/ai-automation",
          description: "Chatbots & Workflow Automation",
          icon: Bot
        },
        {
          title: t('nav.leadFinder'),
          href: "/lead-finder",
          description: "B2B Database of 250M+ Leads",
          icon: Search
        }
      ]
    },
    {
      title: t('nav.tools'),
      children: [
        {
          title: t('nav.growthSim'),
          href: "/marketing-simulator",
          description: "Calculate your potential ROI",
          icon: BarChart3
        },
        {
          title: t('nav.aiPlayground'),
          href: "/playground",
          description: "Test our AI Agents live",
          icon: Layout
        }
      ]
    },
    {
      title: t('nav.resources'),
      children: [
        {
          title: t('nav.caseStudies'),
          href: "/case-studies",
          description: "See our client results",
          icon: FileText
        },
        {
          title: t('nav.blog'),
          href: "/blog",
          description: "Analysis & Guides",
          icon: FileText
        }
      ]
    }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // RTL logic is handled in i18n.ts listener
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4" ref={navRef}>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/40 transition-all duration-500" />
            <img src={logo} alt="HireMediaMind" className="h-10 w-10 relative z-10" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:to-primary transition-all duration-300">
            HireMediaMind
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">

          {/* Home Button */}
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all"
          >
            {t('nav.home')}
          </Link>

          {navItems.map((item) => (
            <div key={item.title} className="relative group/dropdown">
              <button
                className={cn(
                  "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                  activeDropdown === item.title
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
                onClick={() => setActiveDropdown(activeDropdown === item.title ? null : item.title)}
                onMouseEnter={() => setActiveDropdown(item.title)}
              >
                {item.title}
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", activeDropdown === item.title && "rotate-180")} />
              </button>

              {/* Dropdown Menu */}
              <div
                className={cn(
                  "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 p-2 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl transition-all duration-300 origin-top",
                  activeDropdown === item.title
                    ? "opacity-100 scale-100 translate-y-0 visible"
                    : "opacity-0 scale-95 -translate-y-2 invisible"
                )}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <div className="grid gap-1">
                  {item.children?.map((child) => (
                    <Link
                      key={child.title}
                      to={child.href}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent transition-colors group/item"
                    >
                      <div className="mt-1 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform duration-300">
                        <child.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground group-hover/item:text-primary transition-colors">
                          {child.title}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {child.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <Link
            to="/contact"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all"
          >
            {t('nav.contact')}
          </Link>
        </nav>

        {/* Action Group */}
        <div className="hidden md:flex items-center gap-4">

          {/* Language Switcher */}
          <div className="relative group">
            <button className="p-2 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">{i18n.language}</span>
            </button>
            <div className="absolute top-full right-0 mt-2 w-32 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all">
              <button onClick={() => changeLanguage('en')} className={cn("block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-primary", i18n.language === 'en' && "font-bold text-primary")}>English</button>
              <button onClick={() => changeLanguage('es')} className={cn("block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-primary", i18n.language === 'es' && "font-bold text-primary")}>Español</button>
              <button onClick={() => changeLanguage('ar')} className={cn("block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-primary font-arabic", i18n.language === 'ar' && "font-bold text-primary")}>العربية</button>
              <button onClick={() => changeLanguage('de')} className={cn("block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-primary", i18n.language === 'de' && "font-bold text-primary")}>Deutsch</button>
              <button onClick={() => changeLanguage('ru')} className={cn("block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-primary", i18n.language === 'ru' && "font-bold text-primary")}>Русский</button>
              <button onClick={() => changeLanguage('pt')} className={cn("block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-primary", i18n.language === 'pt' && "font-bold text-primary")}>Português</button>
              <button onClick={() => changeLanguage('pl')} className={cn("block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-primary", i18n.language === 'pl' && "font-bold text-primary")}>Polski</button>
            </div>
          </div>

          <Link
            to="/book-call"
            className="btn-primary relative overflow-hidden group shadow-lg shadow-primary/20"
          >
            <span className="relative z-10 flex items-center gap-2">
              {t('nav.bookCall')}
              <Rocket className="h-4 w-4 group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden block p-2 text-foreground hover:bg-accent rounded-lg transition-colors z-50 relative"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-slate-950 md:hidden transition-all duration-300",
          mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        style={{ top: "73px", height: "calc(100vh - 73px)" }}
      >
        <nav className="p-4 space-y-6 h-full overflow-y-auto pb-20">
          {navItems.map((item) => (
            <div key={item.title} className="space-y-3">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">
                {item.title}
              </div>
              <div className="grid gap-2">
                {item.children?.map((child) => (
                  <Link
                    key={child.title}
                    to={child.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mx-2 active:bg-white/10"
                  >
                    <child.icon className="h-5 w-5 text-primary" />
                    <span className="text-base font-medium text-white">{child.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="p-2 space-y-3">
            <div className="flex flex-wrap gap-2 justify-center pb-4 border-b border-white/10">
              {['en', 'es', 'ar', 'de', 'ru', 'pt', 'pl'].map((lng) => (
                <button
                  key={lng}
                  onClick={() => changeLanguage(lng)}
                  className={cn(
                    "px-3 py-1 rounded border border-white/20 text-sm uppercase",
                    i18n.language === lng ? "bg-primary text-white font-bold" : "text-slate-400 hover:text-white"
                  )}
                >
                  {lng}
                </button>
              ))}
            </div>

            <Link
              to="/book-call"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full justify-center py-4 text-base"
            >
              {t('nav.bookCall')}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
