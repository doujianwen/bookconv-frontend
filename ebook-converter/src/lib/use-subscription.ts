import { useState, useEffect } from 'react';

export type PlanLevel = 'free' | 'pro' | 'api';

interface UseSubscriptionResult {
  plan: PlanLevel;
  isPaid: boolean;
  canConvert: boolean;
  maxFileSizeMB: number;
  hourlyLimit: number;
  isLoading: boolean;
  error: string | null;
}

export function useSubscription(userId?: string): UseSubscriptionResult {
  const [plan, setPlan] = useState<PlanLevel>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      if (!userId) {
        setPlan('free');
        setIsLoading(false);
        return;
      }
      try {
        // TODO: Replace with actual Supabase query once DB is set up
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockPlan: Record<string, PlanLevel> = {
          'user-pro': 'pro',
          'user-api': 'api',
        };
        setPlan(mockPlan[userId] || 'free');
      } catch (err: any) {
        console.error('Failed to fetch subscription:', err);
        setError(err.message || 'Failed to load subscription');
        setPlan('free');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSubscription();
  }, [userId]);

  const getLimits = (detectedPlan: PlanLevel) => {
    switch (detectedPlan) {
      case 'pro':
        return { maxFileSizeMB: 50, hourlyLimit: -1, canBatch: true, canAPI: false };
      case 'api':
        return { maxFileSizeMB: 100, hourlyLimit: -1, canBatch: true, canAPI: true };
      default:
        return { maxFileSizeMB: 10, hourlyLimit: 5, canBatch: false, canAPI: false };
    }
  };

  const limits = getLimits(plan);

  return {
    plan,
    isPaid: plan !== 'free',
    canConvert: plan === 'free' ? limits.hourlyLimit > 0 : true,
    maxFileSizeMB: limits.maxFileSizeMB,
    hourlyLimit: limits.hourlyLimit,
    isLoading,
    error,
  };
}

export function useConversionCheck(
  sourceFormat: string,
  targetFormat: string,
  fileSizeMB: number,
  userId?: string
) {
  const { plan, maxFileSizeMB, hourlyLimit, isLoading, error } = useSubscription(userId);
  const canConvert = !isLoading && error === null && fileSizeMB <= maxFileSizeMB;
  const needsUpgrade = !canConvert && fileSizeMB > maxFileSizeMB;
  const needsUpgradeByLimit = !canConvert && plan === 'free' && hourlyLimit <= 0;
  return {
    canConvert,
    needsUpgrade,
    needsUpgradeByLimit,
    plan,
    maxFileSizeMB,
    isLoading,
    error,
  };
}
