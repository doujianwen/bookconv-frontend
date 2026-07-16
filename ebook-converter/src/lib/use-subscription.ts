import { useState, useEffect } from 'react';

export type PlanLevel = 'free' | 'pro' | 'api';

interface SubscriptionRecord {
  user_id: string;
  plan: PlanLevel;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface UseSubscriptionResult {
  plan: PlanLevel;
  isPaid: boolean;
  canConvert: boolean;
  maxFileSizeMB: number;
  hourlyLimit: number;
  isLoading: boolean;
  error: string | null;
}

// Plan limits configuration
const PLAN_LIMITS: Record<PlanLevel, { maxFileSizeMB: number; hourlyLimit: number; canBatch: boolean }> = {
  free: { maxFileSizeMB: 10, hourlyLimit: 5, canBatch: false },
  pro: { maxFileSizeMB: 50, hourlyLimit: -1, canBatch: true },
  api: { maxFileSizeMB: 100, hourlyLimit: -1, canBatch: true },
};

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
        // Import dynamically to avoid SSR issues
        const { createClientInner } = await import('@/lib/supabase/server');
        const supabase = await createClientInner();

        // Query subscription table for this user
        // Use type assertion to handle both real and no-op clients
        const supabaseAny = supabase as any;
        const { data, error: queryError } = await supabaseAny
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (queryError && queryError.code !== 'PGRST116') {
          // PGRST116 means no rows found, which is OK for free users
          console.error('Failed to fetch subscription:', queryError.message);
          setError(queryError.message);
          setPlan('free');
        } else if (data) {
          const sub = data as unknown as SubscriptionRecord;
          setPlan(sub.plan || 'free');
        } else {
          setPlan('free');
        }
      } catch (err: any) {
        console.error('Subscription fetch error:', err.message);
        setError(err.message || 'Failed to load subscription');
        setPlan('free');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, [userId]);

  const limits = PLAN_LIMITS[plan];

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

// Check if user has remaining quota for today
export async function checkDailyQuota(userId: string, limit: number): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const { createClientInner } = await import('@/lib/supabase/server');
    const supabase = await createClientInner();

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const supabaseAny = supabase as any;
    const { data, error } = await supabaseAny
      .from('daily_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const used = data?.count || 0;
    const remaining = Math.max(0, limit - used);

    return { allowed: remaining > 0, remaining };
  } catch (err: any) {
    console.error('Quota check error:', err.message);
    return { allowed: true, remaining: limit }; // Fail open
  }
}

// Increment daily usage count
export async function incrementUsageCount(userId: string): Promise<void> {
  try {
    const { createClientInner } = await import('@/lib/supabase/server');
    const supabase = await createClientInner();

    const today = new Date().toISOString().split('T')[0];

    await (supabase as any)
      .from('daily_usage')
      .upsert(
        { user_id: userId, date: today, count: 1 },
        { onConflict: 'user_id,date' }
      )
      .then((result: any) => {
        if (result.error) throw result.error;
        return result.data;
      });
  } catch (err: any) {
    console.error('Usage count increment error:', err.message);
    // Fail open — don't block conversion
  }
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
