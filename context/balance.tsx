"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from "@clerk/nextjs";

interface UserBalanceContextType {
  userSaldo: number;
  fetchUserSaldo: () => Promise<void>;
}

const UserBalanceContext = createContext<UserBalanceContextType | undefined>(undefined);

export const UserBalanceProvider = ({ children }: { children: ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [userSaldo, setUserSaldo] = useState(0);
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const fetchUserSaldo = async () => {
    if (!isSignedIn || !user?.id) {
      console.log("No hay sesión activa");
      return;
    }

    try {
      const response = await fetch("/api/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener el saldo");
      }

      const data = await response.json();
      if (typeof data.saldo === 'number') {
        setUserSaldo(data.saldo);
      } else {
        console.error("Formato de saldo inválido:", data);
        setUserSaldo(0);
      }
    } catch (err) {
      console.error("Error al obtener el saldo:", err);
      setUserSaldo(0);
    }
  };

  useEffect(() => {
    if (hasMounted && isSignedIn) {
      fetchUserSaldo();
    }
  }, [hasMounted, isSignedIn]);

  if (!hasMounted) return null;

  return (
    <UserBalanceContext.Provider value={{ userSaldo, fetchUserSaldo }}>
      {children}
    </UserBalanceContext.Provider>
  );
};

export const useUserBalance = () => {
  const context = useContext(UserBalanceContext);
  if (context === undefined) {
    throw new Error('useUserBalance debe ser usado dentro de un UserBalanceProvider');
  }
  return context;
};
