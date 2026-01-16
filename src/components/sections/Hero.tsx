import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp, Zap, Bot, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { AIGrowthEcosystem } from "./AIGrowthEcosystem";
import { useTranslation } from "react-i18next";

const floatingIcons = [
  { Icon: TrendingUp, delay: 0, position: "top-20 right-[15%]" },
  { Icon: Zap, delay: 1, position: "top-32 left-[10%]" },
  { Icon: Bot, delay: 2, position: "bottom-32 right-[20%]" },
  { Icon: Sparkles, delay: 1.5, position: "bottom-20 left-[15%]" },
];

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* ... backgrounds ... */}
      <div className="absolute inset-0 aurora-bg" />
      <div className="absolute inset-0 mesh-gradient opacity-60" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 noise-texture" />

      {/* ... animated blobs ... */}
      {/* ... keeping existing blob divs ... */}

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28 overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">

          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full liquid-glass-premium px-4 py-2 animate-glow-pulse"
            >
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-foreground">
                {t('hero.badge')}
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl lg:text-4xl xl:text-5xl"
            >
              {t('hero.title')}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 max-w-xl text-base text-muted-foreground md:text-lg leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 flex flex-wrap items-center gap-4"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://calendly.com/team-hiremediamind/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary via-emerald to-primary bg-[length:200%_auto] px-7 py-4 text-sm font-bold text-primary-foreground shadow-lg transition-all duration-500 hover:bg-[center_right] hover:shadow-2xl hover:shadow-primary/30"
              >
                {t('hero.cta_primary')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </motion.a>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/playground"
                  className="group inline-flex items-center gap-2 rounded-full liquid-glass-premium px-6 py-4 text-sm font-semibold text-foreground transition-all duration-300 hover:shadow-lg"
                >
                  <Bot className="h-4 w-4 text-primary" />
                  {t('hero.cta_secondary')}
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
                Trusted by 250+ brands
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.5s" }} />
                Serving US, UK, UAE & more
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column - AI Growth Ecosystem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            {/* Split-tone dark background - properly contained */}
            <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-slate-900/95 to-transparent rounded-[2rem] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8" />
              <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[100px]" />
              <div className="absolute bottom-1/3 left-1/3 w-[200px] h-[200px] bg-emerald/10 rounded-full blur-[80px]" />
            </div>
            <div className="relative w-full max-w-[550px]">
              <AIGrowthEcosystem />
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-subtle"
        >
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
          <ChevronDown className="h-5 w-5 text-primary" />
        </motion.div>
      </div>
    </section>
  );
}