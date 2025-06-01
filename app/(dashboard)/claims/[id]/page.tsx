"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ClaimTimeline } from "@/components/claim-timeline"
import { ClaimEdiViewer } from "@/components/claim-edi-viewer"
import { ClaimStatusFlow } from "@/components/claim-status-flow"
import { ProtectedRoute } from "@/components/protected-route"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { claimService, type Claim } from "@/lib/database"
import { toast } from "@/hooks/use-toast"

export default function ClaimDetailPage({ params }: { params: { id: string } }) {
  const [claim, setClaim] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClaim() {
      try {
        const data = await claimService.getById(params.id)
        setClaim(data)
      } catch (error) {
        console.error("Error fetching claim:", error)
        toast({
          title: "Error",
          description: "Failed to fetch claim details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClaim()
  }, [params.id])

  const handleStatusUpdate = (newStatus: string) => {
    if (claim) {
      setClaim({ ...claim, status: newStatus, updated_at: new Date().toISOString() })
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardShell>
          <DashboardHeader heading="Loading..." text="Fetching claim details.">
            <Link href="/claims">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Claims
              </Button>
            </Link>
          </DashboardHeader>
        </DashboardShell>
      </ProtectedRoute>
    )
  }

  if (!claim) {
    return (
      <ProtectedRoute>
        <DashboardShell>
          <DashboardHeader heading="Claim Not Found" text="The requested claim could not be found.">
            <Link href="/claims">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Claims
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
        <DashboardHeader heading={`Claim ${claim.claim_number}`} text="View and manage claim details.">
          <div className="flex space-x-2">
            <Link href="/claims">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Claims
              </Button>
            </Link>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export EDI
            </Button>
          </div>
        </DashboardHeader>
        <div className="grid gap-4 md:grid-cols-7">
          <Card className="md:col-span-5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Claim Information</CardTitle>
                <Badge
                  className={
                    claim.status === "approved"
                      ? "bg-green-500"
                      : claim.status === "rejected"
                        ? "bg-red-500"
                        : claim.status === "submitted"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                  }
                >
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </Badge>
              </div>
              <CardDescription>Submitted on {new Date(claim.created_at).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="edi">EDI File</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium">Patient Information</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          {claim.patient?.first_name} {claim.patient?.last_name}
                        </p>
                        <p className="text-sm">DOB: {claim.patient?.date_of_birth}</p>
                        <p className="text-sm">Member ID: {claim.patient?.member_id}</p>
                        <p className="text-sm">
                          {claim.patient?.address}, {claim.patient?.city}, {claim.patient?.state}{" "}
                          {claim.patient?.zip_code}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Provider Information</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">{claim.provider?.name}</p>
                        <p className="text-sm">NPI: {claim.provider?.npi}</p>
                        <p className="text-sm">Tax ID: {claim.provider?.tax_id}</p>
                        <p className="text-sm">
                          {claim.provider?.address}, {claim.provider?.city}, {claim.provider?.state}{" "}
                          {claim.provider?.zip_code}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Claim Details</h3>
                    <div className="mt-2 space-y-1">
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm">Diagnosis Code:</p>
                        <p className="text-sm font-medium">
                          {claim.diagnosis_code} {claim.diagnosis_description && `(${claim.diagnosis_description})`}
                        </p>
                        <p className="text-sm">Service Date:</p>
                        <p className="text-sm font-medium">{new Date(claim.service_date).toLocaleDateString()}</p>
                        <p className="text-sm">Payer:</p>
                        <p className="text-sm font-medium">{claim.payer?.name}</p>
                        <p className="text-sm">Total Amount:</p>
                        <p className="text-sm font-medium">${claim.claim_amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  {claim.service_lines && claim.service_lines.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium">Service Lines</h3>
                      <div className="mt-2">
                        <div className="grid grid-cols-5 gap-2 rounded-md border p-2 text-sm font-medium">
                          <div>Procedure</div>
                          <div>Description</div>
                          <div>Amount</div>
                          <div>Units</div>
                          <div>Total</div>
                        </div>
                        {claim.service_lines.map((line) => (
                          <div key={line.id} className="mt-1 grid grid-cols-5 gap-2 rounded-md border p-2 text-sm">
                            <div>{line.procedure_code}</div>
                            <div>{line.procedure_description || "N/A"}</div>
                            <div>${line.amount.toFixed(2)}</div>
                            <div>{line.units}</div>
                            <div>${(line.amount * line.units).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {claim.notes && (
                    <div>
                      <h3 className="text-sm font-medium">Notes</h3>
                      <p className="mt-2 text-sm">{claim.notes}</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="edi">
                  <ClaimEdiViewer claim={claim} />
                </TabsContent>
                <TabsContent value="history">
                  <ClaimTimeline claimId={claim.id} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <div className="md:col-span-2 space-y-4">
            <ClaimStatusFlow claim={claim} onStatusUpdate={handleStatusUpdate} />
            <Card>
              <CardHeader>
                <CardTitle>Additional Actions</CardTitle>
                <CardDescription>Other claim management actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View 277 Response
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  Generate Report
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  Print Claim
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  )
}
