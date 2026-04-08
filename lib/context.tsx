"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type Role = "user" | "admin" | null

interface AppContextType {
  role: Role
  setRole: (role: Role) => void
  isLoggedIn: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null)

  return (
    <AppContext.Provider value={{ role, setRole, isLoggedIn: role !== null }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
