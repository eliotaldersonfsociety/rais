import type React from "react"
import "../globals.css"
import "./dashboard-variables.css"

export default function DashboardLayouts({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
