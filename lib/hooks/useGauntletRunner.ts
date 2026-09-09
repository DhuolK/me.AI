import { useState, useCallback } from "react";
import { GauntletRunResult } from "@/lib/api/types";
import { apiClient, ApiError } from "@/lib/api/client";

interface UseGauntletRunnerResult {
  isRunning: boolean;
  lastRun: GauntletRunResult | null;
  error: string | null;
  runGauntlet: () => Promise<void>;
}

export function useGauntletRunner(): UseGauntletRunnerResult {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<GauntletRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runGauntlet = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    try {
      const data = await apiClient.gauntlet.run();
      if (!data.success) {
        throw new Error(data.error || "Gauntlet proof execution failed");
      }
      setLastRun(data);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to run gauntlet";
      setError(message);
    } finally {
      setIsRunning(false);
    }
  }, []);

  return { isRunning, lastRun, error, runGauntlet };
}
