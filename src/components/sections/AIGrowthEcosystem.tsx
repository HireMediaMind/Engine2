import { useEffect, useState, useMemo } from "react";
import { 
  Target, 
  MessageCircle, 
  Users, 
  Mail, 
  BarChart3, 
  Cpu,
  Youtube,
  Linkedin,
  Instagram,
  Bot,
  Webhook,
  Phone,
  Zap
} from "lucide-react";

interface EcosystemNode {
  id: string;
  icon: React.ElementType;
  label: string;
  category: "marketing" | "automation" | "core";
  layer: 1 | 2 | 3;
  x: number;
  y: number;
  animationClass: string;
  delay: number;
}

const nodes: EcosystemNode[] = [
  // Core (Layer 1) - Center
  { id: "core", icon: Cpu, label: "Automation Engine", category: "core", layer: 1, x: 50, y: 50, animationClass: "animate-float-core", delay: 0 },
  
  // Performance Marketing (Layer 2) - Left side, well contained
  { id: "google", icon: Target, label: "Google Ads", category: "marketing", layer: 2, x: 15, y: 28, animationClass: "animate-orbit-1", delay: 0 },
  { id: "meta", icon: Target, label: "Meta Ads", category: "marketing", layer: 2, x: 12, y: 50, animationClass: "animate-orbit-2", delay: 0.5 },
  { id: "instagram", icon: Instagram, label: "Instagram Ads", category: "marketing", layer: 2, x: 15, y: 72, animationClass: "animate-orbit-3", delay: 1.0 },
  { id: "youtube", icon: Youtube, label: "YouTube Ads", category: "marketing", layer: 2, x: 30, y: 18, animationClass: "animate-orbit-4", delay: 0.3 },
  { id: "linkedin", icon: Linkedin, label: "LinkedIn Ads", category: "marketing", layer: 2, x: 28, y: 82, animationClass: "animate-orbit-5", delay: 0.8 },
  
  // AI Automation (Layer 2) - Right side, well contained
  { id: "chatbots-web", icon: MessageCircle, label: "AI Chatbots", category: "automation", layer: 2, x: 85, y: 22, animationClass: "animate-orbit-6", delay: 0.2 },
  { id: "chatbots-wa", icon: Phone, label: "WhatsApp Bots", category: "automation", layer: 2, x: 88, y: 50, animationClass: "animate-orbit-7", delay: 0.7 },
  { id: "crm", icon: Users, label: "Lead & CRM", category: "automation", layer: 2, x: 85, y: 72, animationClass: "animate-orbit-8", delay: 1.2 },
  { id: "followup", icon: Mail, label: "Follow-Ups", category: "automation", layer: 2, x: 72, y: 82, animationClass: "animate-orbit-1", delay: 0.4 },
  { id: "analytics", icon: BarChart3, label: "Analytics", category: "automation", layer: 2, x: 70, y: 18, animationClass: "animate-orbit-2", delay: 0.9 },
  
  // Extended Capabilities (Layer 3) - Inner ring
  { id: "agents", icon: Bot, label: "AI Agents", category: "automation", layer: 3, x: 68, y: 38, animationClass: "animate-orbit-3", delay: 0.6 },
  { id: "webhooks", icon: Webhook, label: "Webhooks", category: "automation", layer: 3, x: 32, y: 62, animationClass: "animate-orbit-4", delay: 1.1 },
];

const captions = [
  "Paid ads drive qualified traffic",
  "AI chatbots engage visitors instantly",
  "Leads are scored automatically",
  "Follow-ups run without manual work",
  "Campaigns optimize continuously",
  "Data flows across systems seamlessly",
];

export function AIGrowthEcosystem() {
  const [activeNodeIndex, setActiveNodeIndex] = useState(1);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveNodeIndex((prev) => {
        const nonCoreNodes = nodes.filter(n => n.id !== "core");
        const currentIndex = nonCoreNodes.findIndex(n => nodes.indexOf(n) === prev);
        const nextIndex = (currentIndex + 1) % nonCoreNodes.length;
        return nodes.indexOf(nonCoreNodes[nextIndex]);
      });
      setCaptionIndex((prev) => (prev + 1) % captions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const coreNode = nodes.find(n => n.id === "core")!;

  return (
    <div className="relative w-full h-full min-h-[520px] lg:min-h-[600px] xl:min-h-[650px]">
      {/* Ecosystem Container - transparent (dark bg from parent) */}
      <div className="relative w-full h-full min-h-[520px] lg:min-h-[600px] xl:min-h-[650px] p-2 md:p-3">
        
        {/* Orbital rings for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[60%] rounded-full border border-primary/10 opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[45%] rounded-full border border-secondary/15 opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[30%] rounded-full border border-emerald/20 opacity-60" />
        
        {/* SVG Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="50%" stopColor="hsl(var(--emerald))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glowFilter">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {nodes.filter(n => n.id !== "core").map((node, idx) => (
            <g key={`conn-${node.id}`}>
              <line
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${coreNode.x}%`}
                y2={`${coreNode.y}%`}
                stroke="url(#lineGradient)"
                strokeWidth={node.layer === 2 ? "1.5" : "1"}
                strokeOpacity={node.layer === 2 ? 0.4 : 0.2}
                strokeDasharray={node.layer === 3 ? "4 8" : "none"}
              />
              {!prefersReducedMotion && (
                <circle r={node.layer === 2 ? "4" : "2.5"} fill="hsl(var(--emerald))" filter="url(#glowFilter)">
                  <animateMotion
                    dur={`${3.5 + (idx % 3)}s`}
                    repeatCount="indefinite"
                    keyPoints="0;1;0"
                    keyTimes="0;0.5;1"
                    calcMode="spline"
                    keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
                  >
                    <mpath href={`#path-${node.id}`} />
                  </animateMotion>
                </circle>
              )}
              <path id={`path-${node.id}`} d={`M${node.x} ${node.y} L${coreNode.x} ${coreNode.y}`} fill="none" stroke="none" />
            </g>
          ))}
        </svg>

        {/* Absolutely Positioned Floating Nodes with Hover Micro-interactions */}
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isActive = index === activeNodeIndex;
          const isCore = node.id === "core";
          const isLayer3 = node.layer === 3;
          
          return (
            <div
              key={node.id}
              className={`absolute ${!prefersReducedMotion ? node.animationClass : ""} group/node`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: isCore ? 30 : isActive ? 25 : node.layer === 2 ? 15 : 10,
                animationDelay: `${node.delay}s`,
              }}
            >
              <div
                className={`
                  relative rounded-2xl backdrop-blur-md border transition-all duration-300 cursor-pointer
                  ${isCore 
                    ? "p-4 md:p-5 bg-gradient-to-br from-slate-800/95 via-slate-900 to-slate-800/95 border-primary/70 shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:border-primary" 
                    : isLayer3
                    ? "p-2 md:p-2.5 bg-slate-800/60 border-slate-600/30 opacity-60 hover:opacity-100 hover:border-primary/40"
                    : "p-2.5 md:p-3.5 bg-slate-800/80 border-slate-600/40 shadow-lg shadow-black/20 hover:shadow-primary/30 hover:border-primary/60 hover:bg-slate-700/90"
                  }
                  ${isActive && !isCore ? "scale-110 border-primary/80 shadow-xl shadow-primary/40 !bg-slate-700/90" : ""}
                  group-hover/node:scale-105
                `}
              >
                {/* Core Glow - Enhanced on hover */}
                {isCore && !prefersReducedMotion && (
                  <>
                    <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/50 via-emerald/40 to-secondary/50 blur-xl -z-10 animate-pulse transition-all duration-300 group-hover/node:from-primary/70 group-hover/node:via-emerald/60 group-hover/node:to-secondary/70" />
                    <div className="absolute -inset-8 rounded-3xl bg-primary/20 blur-2xl -z-20 animate-pulse transition-all duration-300 group-hover/node:bg-primary/30" style={{ animationDuration: "3s" }} />
                  </>
                )}
                
                {/* Active Glow */}
                {isActive && !isCore && (
                  <div className="absolute -inset-2 rounded-2xl bg-primary/40 blur-lg -z-10 animate-pulse" />
                )}
                
                {/* Hover Glow for non-core nodes */}
                {!isCore && (
                  <div className="absolute -inset-2 rounded-2xl bg-primary/0 blur-lg -z-10 transition-all duration-300 group-hover/node:bg-primary/30" />
                )}
                
                <div className="flex items-center gap-2 md:gap-2.5">
                  <div className={`
                    flex items-center justify-center rounded-xl shrink-0 transition-all duration-300
                    ${isCore 
                      ? "h-11 w-11 md:h-14 md:w-14 bg-gradient-to-br from-primary via-emerald to-secondary shadow-lg group-hover/node:shadow-xl group-hover/node:shadow-primary/40" 
                      : isLayer3
                      ? "h-7 w-7 md:h-8 md:w-8 bg-gradient-to-br from-primary/20 to-secondary/20 group-hover/node:from-primary/40 group-hover/node:to-secondary/40"
                      : "h-9 w-9 md:h-10 md:w-10 bg-gradient-to-br from-primary/30 to-secondary/30 group-hover/node:from-primary/50 group-hover/node:to-secondary/50"
                    }
                  `}>
                    <Icon className={`
                      transition-all duration-300
                      ${isCore ? "h-5 w-5 md:h-7 md:w-7 text-white" : isLayer3 ? "h-3.5 w-3.5 md:h-4 md:w-4 text-primary/70 group-hover/node:text-primary" : "h-4 w-4 md:h-5 md:w-5 text-primary group-hover/node:text-primary"}
                    `} />
                  </div>
                  <span className={`
                    font-semibold whitespace-nowrap transition-all duration-300
                    ${isCore 
                      ? "text-xs md:text-sm text-white font-bold" 
                      : isLayer3 
                      ? "text-[9px] md:text-[10px] text-slate-400 hidden sm:block group-hover/node:text-slate-200"
                      : "text-[10px] md:text-xs text-slate-200 group-hover/node:text-white"
                    }
                  `}>
                    {node.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Caption Overlay - Bottom */}
        <div className="absolute bottom-4 md:bottom-6 left-4 right-4 md:left-6 md:right-6 z-40">
          <div className="rounded-xl bg-slate-800/90 backdrop-blur-xl border border-slate-600/40 p-3 md:p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald shadow-md shadow-emerald/50" />
              </span>
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
                <p className={`text-xs md:text-sm text-white font-medium ${!prefersReducedMotion ? "animate-fade-in" : ""}`} key={captionIndex}>
                  {captions[captionIndex]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Keyframe Animations - Circular/Orbital Motion */}
      <style>{`
        /* Orbital circular motion animations */
        @keyframes orbit-1 {
          0% { transform: translate(-50%, -50%) translate(0, 0); }
          25% { transform: translate(-50%, -50%) translate(8px, -6px); }
          50% { transform: translate(-50%, -50%) translate(0, -10px); }
          75% { transform: translate(-50%, -50%) translate(-8px, -5px); }
          100% { transform: translate(-50%, -50%) translate(0, 0); }
        }
        @keyframes orbit-2 {
          0% { transform: translate(-50%, -50%) translate(0, 0); }
          25% { transform: translate(-50%, -50%) translate(-7px, 7px); }
          50% { transform: translate(-50%, -50%) translate(-10px, 0); }
          75% { transform: translate(-50%, -50%) translate(-6px, -7px); }
          100% { transform: translate(-50%, -50%) translate(0, 0); }
        }
        @keyframes orbit-3 {
          0% { transform: translate(-50%, -50%) translate(0, 0); }
          25% { transform: translate(-50%, -50%) translate(6px, 8px); }
          50% { transform: translate(-50%, -50%) translate(0, 10px); }
          75% { transform: translate(-50%, -50%) translate(-6px, 6px); }
          100% { transform: translate(-50%, -50%) translate(0, 0); }
        }
        @keyframes orbit-4 {
          0% { transform: translate(-50%, -50%) translate(0, 0); }
          25% { transform: translate(-50%, -50%) translate(9px, 5px); }
          50% { transform: translate(-50%, -50%) translate(10px, 0); }
          75% { transform: translate(-50%, -50%) translate(7px, -6px); }
          100% { transform: translate(-50%, -50%) translate(0, 0); }
        }
        @keyframes orbit-5 {
          0% { transform: translate(-50%, -50%) translate(0, 0); }
          25% { transform: translate(-50%, -50%) translate(-5px, -8px); }
          50% { transform: translate(-50%, -50%) translate(-8px, -4px); }
          75% { transform: translate(-50%, -50%) translate(-5px, 6px); }
          100% { transform: translate(-50%, -50%) translate(0, 0); }
        }
        @keyframes orbit-6 {
          0% { transform: translate(-50%, -50%) translate(0, 0); }
          25% { transform: translate(-50%, -50%) translate(7px, -7px); }
          50% { transform: translate(-50%, -50%) translate(9px, 3px); }
          75% { transform: translate(-50%, -50%) translate(4px, 8px); }
          100% { transform: translate(-50%, -50%) translate(0, 0); }
        }
        @keyframes orbit-7 {
          0% { transform: translate(-50%, -50%) translate(0, 0); }
          25% { transform: translate(-50%, -50%) translate(-8px, 6px); }
          50% { transform: translate(-50%, -50%) translate(-6px, -6px); }
          75% { transform: translate(-50%, -50%) translate(5px, -7px); }
          100% { transform: translate(-50%, -50%) translate(0, 0); }
        }
        @keyframes orbit-8 {
          0% { transform: translate(-50%, -50%) translate(0, 0); }
          25% { transform: translate(-50%, -50%) translate(6px, 6px); }
          50% { transform: translate(-50%, -50%) translate(-5px, 8px); }
          75% { transform: translate(-50%, -50%) translate(-8px, 2px); }
          100% { transform: translate(-50%, -50%) translate(0, 0); }
        }
        @keyframes float-core {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.03); }
        }
        
        .animate-orbit-1 { animation: orbit-1 6s ease-in-out infinite; }
        .animate-orbit-2 { animation: orbit-2 7s ease-in-out infinite; }
        .animate-orbit-3 { animation: orbit-3 8s ease-in-out infinite; }
        .animate-orbit-4 { animation: orbit-4 6.5s ease-in-out infinite; }
        .animate-orbit-5 { animation: orbit-5 7.5s ease-in-out infinite; }
        .animate-orbit-6 { animation: orbit-6 5.5s ease-in-out infinite; }
        .animate-orbit-7 { animation: orbit-7 8.5s ease-in-out infinite; }
        .animate-orbit-8 { animation: orbit-8 7s ease-in-out infinite; }
        .animate-float-core { animation: float-core 3s ease-in-out infinite; }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-orbit-1, .animate-orbit-2, .animate-orbit-3, .animate-orbit-4,
          .animate-orbit-5, .animate-orbit-6, .animate-orbit-7, .animate-orbit-8,
          .animate-float-core {
            animation: none !important;
          }
        }
        
        @media (max-width: 640px) {
          .animate-orbit-1, .animate-orbit-2, .animate-orbit-3, .animate-orbit-4,
          .animate-orbit-5, .animate-orbit-6, .animate-orbit-7, .animate-orbit-8 {
            animation-duration: 10s;
          }
        }
      `}</style>
    </div>
  );
}
