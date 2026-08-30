import { useEffect, useState } from "react";
import type { Paddle } from "@paddle/paddle-js";
import { getPaddleClientConfig } from "@/lib/paddle.functions";

let paddlePromise: Promise<Paddle | undefined> | undefined;

function loadPaddle() {
  paddlePromise ??= (async () => {
    const config = await getPaddleClientConfig();
    if (!config.token) return undefined;
    const { initializePaddle } = await import("@paddle/paddle-js");
    return initializePaddle({ token: config.token, environment: config.environment });
  })().catch((error) => {
    console.error("Paddle.js failed to initialize:", error);
    return undefined;
  });
  return paddlePromise;
}

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | undefined>();
  useEffect(() => {
    let active = true;
    void loadPaddle().then((instance) => active && setPaddle(instance));
    return () => { active = false; };
  }, []);
  return paddle;
}
