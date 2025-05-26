import { useState, useEffect, useCallback } from "react";
import { StatusHistoryDto } from "@/types/DimonaTypes";
import { dimonaService } from "@/services/api/dimonaService";
import { toast } from "sonner";

interface UseStatusHistoryReturn {
  history: StatusHistoryDto[];
  loading: boolean;
  error: string | null;
  count: number;
  latestChange: StatusHistoryDto | null;
  refreshHistory: () => Promise<void>;
  refreshCount: () => Promise<void>;
}

export function useStatusHistory(dimonaId: string): UseStatusHistoryReturn {
  const [history, setHistory] = useState<StatusHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [latestChange, setLatestChange] = useState<StatusHistoryDto | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dimonaService.getStatusHistory(dimonaId);
      // Sort by date descending (most recent first)
      const sortedData = data.sort((a, b) => 
        new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
      );
      
      setHistory(sortedData);
      setCount(sortedData.length);
      setLatestChange(sortedData[0] || null);
    } catch (err) {
      const errorMessage = "Erreur lors du chargement de l'historique";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dimonaId]);

  const fetchCount = useCallback(async () => {
    try {
      const historyCount = await dimonaService.getStatusHistoryCount(dimonaId);
      setCount(historyCount);
    } catch (err) {
      console.error("Error fetching status history count:", err);
    }
  }, [dimonaId]);

  const fetchLatestChange = useCallback(async () => {
    try {
      const latest = await dimonaService.getLatestStatusChange(dimonaId);
      setLatestChange(latest);
    } catch (err) {
      console.error("Error fetching latest status change:", err);
    }
  }, [dimonaId]);

  useEffect(() => {
    if (dimonaId) {
      fetchHistory();
    }
  }, [dimonaId, fetchHistory]);

  const refreshHistory = useCallback(async () => {
    await fetchHistory();
  }, [fetchHistory]);

  const refreshCount = useCallback(async () => {
    await fetchCount();
  }, [fetchCount]);

  return {
    history,
    loading,
    error,
    count,
    latestChange,
    refreshHistory,
    refreshCount,
  };
}

// Hook simplifié pour récupérer seulement le nombre de changements
export function useStatusHistoryCount(dimonaId: string) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const historyCount = await dimonaService.getStatusHistoryCount(dimonaId);
        setCount(historyCount);
      } catch (error) {
        console.error("Error fetching status history count:", error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (dimonaId) {
      fetchCount();
    }
  }, [dimonaId]);

  const refresh = useCallback(async () => {
    try {
      const historyCount = await dimonaService.getStatusHistoryCount(dimonaId);
      setCount(historyCount);
    } catch (error) {
      console.error("Error refreshing status history count:", error);
    }
  }, [dimonaId]);

  return { count, loading, refresh };
}
