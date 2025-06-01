"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ClaimsTableFilter } from "@/components/claims-table-filter"
import { ClaimsTablePagination } from "@/components/claims-table-pagination"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import { claimService, type Claim } from "@/lib/database"
// Add ProtectedRoute wrapper
import { ProtectedRoute } from "@/components/protected-route"

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchClaims() {
      try {
        const data = await claimService.getAll()
        setClaims(data)
      } catch (error) {
        console.error("Error fetching claims:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClaims()
  }, [])

  const filteredClaims = claims.filter(
    (claim) =>
      claim.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardShell>
          <DashboardHeader heading="Claims Management" text="Loading claims...">
            <Link href="/claims/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Claim
              </Button>
            </Link>
          </DashboardHeader>
        </DashboardShell>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardShell>
        <DashboardHeader heading="Claims Management" text="View and manage all your insurance claims.">
          <Link href="/claims/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Claim
            </Button>
          </Link>
        </DashboardHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search claims..."
                  className="w-full rounded-md pl-8 md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <ClaimsTableFilter />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.claim_number}</TableCell>
                    <TableCell>
                      {claim.patient ? `${claim.patient.first_name} ${claim.patient.last_name}` : "N/A"}
                    </TableCell>
                    <TableCell>{claim.provider?.name || "N/A"}</TableCell>
                    <TableCell>{claim.diagnosis_code}</TableCell>
                    <TableCell>${claim.claim_amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell>{new Date(claim.service_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/claims/${claim.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ClaimsTablePagination />
        </div>
      </DashboardShell>
    </ProtectedRoute>
  )
}
