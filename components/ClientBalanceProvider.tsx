"use client";
import { useUser } from "@clerk/nextjs";
import { UserBalanceProvider } from "@/context/balance";

export default function ClientBalanceProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useUser();
  if (!isLoaded) return null;
  return (
    <UserBalanceProvider>
      {children}
    </UserBalanceProvider>
  );
}