"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface AuditLogEntry {
  id: string
  user_email: string
  action: string
  entity_type: string
  entity_id: string
  details: string
  created_at: string
}

export function AdminAuditLog() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Mock audit log data - in a real app, you would fetch this from your database
    const mockAuditLogs: AuditLogEntry[] = [
      {
        id: "1",
        user_email: "admin@procentric.com",
        action: "CREATE",
        entity_type: "claim",
        entity_id: "CLM001",
        details: "Created new claim for patient John Doe",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        user_email: "staff@procentric.com",
        action: "UPDATE",
        entity_type: "patient",
        entity_id: "PAT001",
        details: "Updated patient information",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "3",
        user_email: "provider@procentric.com",
        action: "DELETE",
        entity_type: "service_line",
        entity_id: "SL001",
        details: "Deleted service line from claim",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ]

    setAuditLogs(mockAuditLogs)
    setLoading(false)
  }, [])

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Badge className="bg-green-500">Create</Badge>
      case "UPDATE":
        return <Badge className="bg-blue-500">Update</Badge>
      case "DELETE":
        return <Badge className="bg-red-500">Delete</Badge>
      default:
        return <Badge>{action}</Badge>
    }
  }

  if (loading) {
    return <div>Loading audit logs...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search audit logs..."
            className="w-full rounded-md pl-8 md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.user_email}</TableCell>
                <TableCell>{getActionBadge(log.action)}</TableCell>
                <TableCell>
                  {log.entity_type} ({log.entity_id})
                </TableCell>
                <TableCell>{log.details}</TableCell>
                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
