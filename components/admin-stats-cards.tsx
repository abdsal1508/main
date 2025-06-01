"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Building, CreditCard } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function AdminStatsCards() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClaims: 0,
    totalProviders: 0,
    totalPayers: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersResult, claimsResult, providersResult, payersResult] = await Promise.all([
          supabase.from("users").select("id", { count: "exact" }),
          supabase.from("claims").select("id", { count: "exact" }),
          supabase.from("providers").select("id", { count: "exact" }),
          supabase.from("payers").select("id", { count: "exact" }),
        ])

        setStats({
          totalUsers: usersResult.count || 0,
          totalClaims: claimsResult.count || 0,
          totalProviders: providersResult.count || 0,
          totalPayers: payersResult.count || 0,
        })
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">Registered users</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClaims}</div>
          <p className="text-xs text-muted-foreground">All time claims</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Providers</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProviders}</div>
          <p className="text-xs text-muted-foreground">Healthcare providers</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payers</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPayers}</div>
          <p className="text-xs text-muted-foreground">Insurance payers</p>
        </CardContent>
      </Card>
    </div>
  )
}
