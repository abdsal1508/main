"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, FileText, Send } from "lucide-react"
import { claimService } from "@/lib/database"
import { toast } from "@/hooks/use-toast"

interface ClaimStatusFlowProps {
  claim: any
  onStatusUpdate: (newStatus: string) => void
}

export function ClaimStatusFlow({ claim, onStatusUpdate }: ClaimStatusFlowProps) {
  const [updating, setUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      await claimService.update(claim.id, { status: newStatus })
      onStatusUpdate(newStatus)
      toast({
        title: "Status Updated",
        description: `Claim status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update claim status.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "submitted":
        return <Send className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getNextActions = () => {
    switch (claim.status) {
      case "pending":
        return [
          { label: "Submit to Payer", status: "submitted", variant: "default" as const },
          { label: "Mark as Rejected", status: "rejected", variant: "destructive" as const },
        ]
      case "submitted":
        return [
          { label: "Mark as Approved", status: "approved", variant: "default" as const },
          { label: "Mark as Rejected", status: "rejected", variant: "destructive" as const },
        ]
      case "approved":
        return []
      case "rejected":
        return [{ label: "Resubmit Claim", status: "pending", variant: "default" as const }]
      default:
        return []
    }
  }

  const nextActions = getNextActions()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(claim.status)}
          Claim Status Flow
        </CardTitle>
        <CardDescription>Current status and available actions for this claim.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Status:</span>
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

        {nextActions.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Available Actions:</span>
            <div className="space-y-2">
              {nextActions.map((action) => (
                <Button
                  key={action.status}
                  variant={action.variant}
                  size="sm"
                  className="w-full"
                  onClick={() => handleStatusUpdate(action.status)}
                  disabled={updating}
                >
                  {updating ? "Updating..." : action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <span className="text-sm font-medium">Status History:</span>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Created</span>
                <span>{new Date(claim.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Last Updated</span>
                <span>{new Date(claim.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
