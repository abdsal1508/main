"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { claimService, type Claim } from "@/lib/database"

export function RecentClaimsTable() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClaims() {
      try {
        const data = await claimService.getAll()
        setClaims(data.slice(0, 5)) // Show only the 5 most recent claims
      } catch (error) {
        console.error("Error fetching claims:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClaims()
  }, [])

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
    return <div>Loading recent claims...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Claim ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((claim) => (
            <TableRow key={claim.id}>
              <TableCell className="font-medium">{claim.claim_number}</TableCell>
              <TableCell>{claim.patient ? `${claim.patient.first_name} ${claim.patient.last_name}` : "N/A"}</TableCell>
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
  )
}
