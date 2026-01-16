import { useState, useEffect, useCallback } from 'react';

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Progress {
  xp: number;
  level: number;
  nextLevelXP: number;
}

interface GamificationState {
  progress: Progress;
  badges: Badge[];
  completedDemos: string[];
  addXP: (amount: number) => void;
  markDemoCompleted: (demoId: string) => void;
  unlockBadge: (badgeId: string) => void;
}

const BADGE_DEFINITIONS: Record<string, Badge> = {
  explorer: {
    id: 'explorer',
    name: 'Automation Explorer',
    icon: '🔍',
    description: 'Completed your first demo'
  },
  tester: {
    id: 'tester',
    name: 'AI Tester',
    icon: '🤖',
    description: 'Tested all available demos'
  },
  strategist: {
    id: 'strategist',
    name: 'Growth Strategist',
    icon: '📈',
    description: 'Explored marketing simulator'
  },
  speedster: {
    id: 'speedster',
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Completed 3 demos in one session'
  },
  curious: {
    id: 'curious',
    name: 'Curious Mind',
    icon: '💡',
    description: 'Asked questions in chatbot demo'
  }
};

const STORAGE_KEY = 'hiremediamind_gamification';

export function useGamification(): GamificationState {
  const [progress, setProgress] = useState<Progress>({ xp: 0, level: 1, nextLevelXP: 100 });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [completedDemos, setCompletedDemos] = useState<string[]>([]);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setProgress(data.progress || { xp: 0, level: 1, nextLevelXP: 100 });
        setBadges(data.badges || []);
        setCompletedDemos(data.completedDemos || []);
      } catch (e) {
        console.error('Failed to parse gamification data:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      progress,
      badges,
      completedDemos
    }));
  }, [progress, badges, completedDemos]);

  const calculateLevel = (xp: number): { level: number; nextLevelXP: number } => {
    const baseXP = 100;
    let level = 1;
    let xpForNextLevel = baseXP;
    let totalXPForLevel = 0;

    while (totalXPForLevel + xpForNextLevel <= xp) {
      totalXPForLevel += xpForNextLevel;
      level++;
      xpForNextLevel = Math.floor(baseXP * Math.pow(1.5, level - 1));
    }

    return { level, nextLevelXP: totalXPForLevel + xpForNextLevel };
  };

  const addXP = useCallback((amount: number) => {
    setProgress(prev => {
      const newXP = prev.xp + amount;
      const { level, nextLevelXP } = calculateLevel(newXP);
      return { xp: newXP, level, nextLevelXP };
    });
  }, []);

  const markDemoCompleted = useCallback((demoId: string) => {
    setCompletedDemos(prev => {
      if (prev.includes(demoId)) return prev;
      const newCompleted = [...prev, demoId];
      
      // Check for badge unlocks
      if (newCompleted.length === 1 && !badges.find(b => b.id === 'explorer')) {
        setBadges(prev => [...prev, BADGE_DEFINITIONS.explorer]);
      }
      
      if (newCompleted.length >= 3 && !badges.find(b => b.id === 'tester')) {
        setBadges(prev => [...prev, BADGE_DEFINITIONS.tester]);
      }

      return newCompleted;
    });
  }, [badges]);

  const unlockBadge = useCallback((badgeId: string) => {
    const badge = BADGE_DEFINITIONS[badgeId];
    if (badge && !badges.find(b => b.id === badgeId)) {
      setBadges(prev => [...prev, badge]);
    }
  }, [badges]);

  return {
    progress,
    badges,
    completedDemos,
    addXP,
    markDemoCompleted,
    unlockBadge
  };
}