"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ThankYouRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Construye la nueva URL manteniendo los query params
    const params = searchParams.toString();
    router.replace(`/thankyou/ok${params ? "?" + params : ""}`);
  }, [router, searchParams]);

  return null; // O un loader si quieres
}
