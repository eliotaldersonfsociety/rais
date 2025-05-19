import { UserBalanceTable } from "@/components/user-balance-table"
import { DashboardLayout } from "@/components/dashboard-layouts"    

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>
        <UserBalanceTable />
      </div>
    </DashboardLayout>
  )
}
