"use client"

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface ClaimStatusChartProps {
  data: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
}

export function ClaimStatusChart({ data }: ClaimStatusChartProps) {
  const chartData = [
    { name: "Approved", value: data.approved, color: "#10b981" },
    { name: "Pending", value: data.pending, color: "#f59e0b" },
    { name: "Rejected", value: data.rejected, color: "#ef4444" },
  ]

  return (
    <Card className="w-full">
      <ChartContainer
        config={{
          approved: {
            label: "Approved",
            color: "#10b981",
          },
          pending: {
            label: "Pending",
            color: "#f59e0b",
          },
          rejected: {
            label: "Rejected",
            color: "#ef4444",
          },
        }}
        className="h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  )
}
