"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function usePageView() {
  const pathname = usePathname();

  useEffect(() => {
    // Get or create sessionId
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem('sessionId', sessionId);
    }

    // Track page visit
    fetch("/api/visitas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathname }),
    });

    // Track active user
    fetch("/api/active-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, pathname }),
    });

    // Set up interval to keep session alive
    const interval = setInterval(() => {
      fetch("/api/active-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, pathname }),
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [pathname]);
}
