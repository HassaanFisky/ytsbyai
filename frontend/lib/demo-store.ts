import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DemoQuota {
  summary: {
    used: number;
    limit: number;
    remaining: number;
  };
  transcription: {
    used: number;
    limit: number;
    remaining: number;
  };
}

interface DemoStats {
  guest_id: string;
  session_id: string;
  created_at: string;
  ip_address: string;
  usage: DemoQuota;
  total_used: number;
  total_limit: number;
  has_any_quota: boolean;
}

interface QuotaExceededState {
  service: 'summary' | 'transcription' | null;
  isModalOpen: boolean;
  quotaInfo: {
    service: 'summary' | 'transcription';
    used: number;
    limit: number;
    remaining: number;
  } | null;
}

interface DemoStore {
  // State
  demoStats: DemoStats | null;
  quotaExceeded: QuotaExceededState;
  isLoading: boolean;
  error: string | null;

  // Actions
  setDemoStats: (stats: DemoStats) => void;
  updateQuota: (service: 'summary' | 'transcription', newUsed: number) => void;
  setQuotaExceeded: (service: 'summary' | 'transcription', quotaInfo: any) => void;
  closeQuotaModal: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetStore: () => void;

  // Computed
  isQuotaExceeded: (service: 'summary' | 'transcription') => boolean;
  getQuotaProgress: (service: 'summary' | 'transcription') => number;
  shouldShowModal: () => boolean;
}

const initialState = {
  demoStats: null,
  quotaExceeded: {
    service: null,
    isModalOpen: false,
    quotaInfo: null,
  },
  isLoading: false,
  error: null,
};

export const useDemoStore = create<DemoStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Actions
      setDemoStats: (stats: DemoStats) => {
        set({ demoStats: stats, error: null });
      },

      updateQuota: (service: 'summary' | 'transcription', newUsed: number) => {
        const { demoStats } = get();
        if (!demoStats) return;

        const updatedStats = {
          ...demoStats,
          usage: {
            ...demoStats.usage,
            [service]: {
              ...demoStats.usage[service],
              used: newUsed,
              remaining: Math.max(0, demoStats.usage[service].limit - newUsed),
            },
          },
        };

        set({ demoStats: updatedStats });

        // Check if quota is exceeded and trigger modal
        const isExceeded = newUsed >= demoStats.usage[service].limit;
        if (isExceeded) {
          const quotaInfo = {
            service,
            used: newUsed,
            limit: demoStats.usage[service].limit,
            remaining: 0,
          };
          get().setQuotaExceeded(service, quotaInfo);
        }
      },

      setQuotaExceeded: (service: 'summary' | 'transcription', quotaInfo: any) => {
        set({
          quotaExceeded: {
            service,
            isModalOpen: true,
            quotaInfo,
          },
        });
      },

      closeQuotaModal: () => {
        set({
          quotaExceeded: {
            service: null,
            isModalOpen: false,
            quotaInfo: null,
          },
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      resetStore: () => {
        set(initialState);
      },

      // Computed
      isQuotaExceeded: (service: 'summary' | 'transcription') => {
        const { demoStats } = get();
        if (!demoStats) return false;
        return demoStats.usage[service].used >= demoStats.usage[service].limit;
      },

      getQuotaProgress: (service: 'summary' | 'transcription') => {
        const { demoStats } = get();
        if (!demoStats) return 0;
        const { used, limit } = demoStats.usage[service];
        return (used / limit) * 100;
      },

      shouldShowModal: () => {
        const { quotaExceeded } = get();
        return quotaExceeded.isModalOpen && quotaExceeded.quotaInfo !== null;
      },
    }),
    {
      name: 'demo-store',
    }
  )
);

// Selectors for better performance
export const useDemoStats = () => useDemoStore((state) => state.demoStats);
export const useQuotaExceeded = () => useDemoStore((state) => state.quotaExceeded);
export const useIsLoading = () => useDemoStore((state) => state.isLoading);
export const useError = () => useDemoStore((state) => state.error);

// Action hooks
export const useDemoActions = () => useDemoStore((state) => ({
  setDemoStats: state.setDemoStats,
  updateQuota: state.updateQuota,
  setQuotaExceeded: state.setQuotaExceeded,
  closeQuotaModal: state.closeQuotaModal,
  setLoading: state.setLoading,
  setError: state.setError,
  resetStore: state.resetStore,
}));

// Computed hooks
export const useQuotaHelpers = () => useDemoStore((state) => ({
  isQuotaExceeded: state.isQuotaExceeded,
  getQuotaProgress: state.getQuotaProgress,
  shouldShowModal: state.shouldShowModal,
})); 