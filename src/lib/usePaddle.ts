import { useEffect, useState } from "react";
import type { Paddle } from "@paddle/paddle-js";
import { getPaddleClientConfig } from "@/lib/paddle.functions";

type PaddleLoadResult = { paddle?: Paddle; error?: string };
let paddlePromise: Promise<PaddleLoadResult> | undefined;

function loadPaddle() {
  paddlePromise ??= (async () => {
    const config = await getPaddleClientConfig();
    if (!config.token) return { error: "Checkout is not configured yet." };
    const { initializePaddle } = await import("@paddle/paddle-js");
    const paddle = await initializePaddle({ token: config.token, environment: config.environment });
    return paddle ? { paddle } : { error: "Checkout could not be initialized." };
  })().catch((error) => {
    console.error("Paddle.js failed to initialize:", error);
    return { error: "Checkout is temporarily unavailable." };
  });
  return paddlePromise;
}

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void loadPaddle().then((result) => {
      if (!active) return;
      setPaddle(result.paddle);
      setError(result.error ?? null);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);
  return { paddle, loading, error };
}
