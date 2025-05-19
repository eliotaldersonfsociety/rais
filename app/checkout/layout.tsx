// app/checkout/layout.tsx
import { UserBalanceProvider } from "@/context/balance";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserBalanceProvider>
      {children}
    </UserBalanceProvider>
  );
}