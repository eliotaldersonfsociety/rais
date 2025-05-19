"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const ClientCartProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { clearCart } = useCart();

  useEffect(() => {
    if (pathname === "/thx" || pathname === "/thankyou") {
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);  // ya no incluimos clearCart aquí

  return <>{children}</>;
};

export default ClientCartProvider;
