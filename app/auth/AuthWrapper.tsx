// app/auth/AuthWrapper.tsx
"use client";

import { Suspense } from "react";
import AuthPage from "./AuthPage";

export default function AuthWrapper() {
  return (
    <Suspense fallback={<div>Cargando autenticación...</div>}>
      <AuthPage />
    </Suspense>
  );
}
