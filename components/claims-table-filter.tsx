"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter } from "lucide-react"

export function ClaimsTableFilter() {
  const [showPending, setShowPending] = React.useState(true)
  const [showApproved, setShowApproved] = React.useState(true)
  const [showRejected, setShowRejected] = React.useState(true)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showPending} onCheckedChange={setShowPending}>
          Pending
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showApproved} onCheckedChange={setShowApproved}>
          Approved
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showRejected} onCheckedChange={setShowRejected}>
          Rejected
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
