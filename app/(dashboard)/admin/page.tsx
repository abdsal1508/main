"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProtectedRoute } from "@/components/protected-route"
import { AdminUsersTable } from "@/components/admin-users-table"
import { AdminStatsCards } from "@/components/admin-stats-cards"
import { AdminSystemSettings } from "@/components/admin-system-settings"
import { AdminAuditLog } from "@/components/admin-audit-log"
import { Users, Settings, Activity, BarChart3 } from "lucide-react"

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardShell>
        <DashboardHeader heading="Admin Panel" text="Manage users, system settings, and monitor system activity." />

        <AdminStatsCards />

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts, roles, and permissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUsersTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Claims Analytics</CardTitle>
                  <CardDescription>Detailed analytics of claims processing.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Claims analytics dashboard will be displayed here.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Monitor user activity and system usage.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">User activity metrics will be displayed here.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>System performance and health metrics.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Performance metrics will be displayed here.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings and preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSystemSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>View system audit logs and user activities.</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAuditLog />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </ProtectedRoute>
  )
}
