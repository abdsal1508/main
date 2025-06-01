"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClaimStatusChartProps {
  data: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
}

export function ClaimStatusChart({ data }: ClaimStatusChartProps) {
  const total = data.total || 1 // Avoid division by zero

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Claim Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Approved</span>
            <span className="text-sm font-medium">{data.approved}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(data.approved / total) * 100}%` }}></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Pending</span>
            <span className="text-sm font-medium">{data.pending}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(data.pending / total) * 100}%` }}></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Rejected</span>
            <span className="text-sm font-medium">{data.rejected}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(data.rejected / total) * 100}%` }}></div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between font-medium">
            <span>Total Claims</span>
            <span>{data.total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
