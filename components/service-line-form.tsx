"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"

interface ServiceLineFormProps {
  id: number
  procedureCode: string
  procedureDescription: string
  amount: string
  units: string
  onUpdate: (id: number, field: string, value: string) => void
  onRemove: (id: number) => void
  canRemove: boolean
}

export function ServiceLineForm({
  id,
  procedureCode,
  procedureDescription,
  amount,
  units,
  onUpdate,
  onRemove,
  canRemove,
}: ServiceLineFormProps) {
  return (
    <div className="grid grid-cols-12 gap-4 items-end border p-4 rounded-md">
      <div className="col-span-3">
        <Label htmlFor={`procedure-${id}`}>Procedure Code (CPT/HCPCS)</Label>
        <Input
          id={`procedure-${id}`}
          value={procedureCode}
          placeholder="e.g. 99213"
          onChange={(e) => onUpdate(id, "procedureCode", e.target.value)}
        />
      </div>
      <div className="col-span-4">
        <Label htmlFor={`description-${id}`}>Description</Label>
        <Input
          id={`description-${id}`}
          value={procedureDescription}
          placeholder="e.g. Office visit"
          onChange={(e) => onUpdate(id, "procedureDescription", e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <Label htmlFor={`amount-${id}`}>Amount ($)</Label>
        <Input
          id={`amount-${id}`}
          value={amount}
          placeholder="0.00"
          onChange={(e) => onUpdate(id, "amount", e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <Label htmlFor={`units-${id}`}>Units</Label>
        <Input
          id={`units-${id}`}
          value={units}
          placeholder="1"
          onChange={(e) => onUpdate(id, "units", e.target.value)}
        />
      </div>
      <div className="col-span-1 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(id)}
          disabled={!canRemove}
          className="h-10 w-10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove service line</span>
        </Button>
      </div>
    </div>
  )
}
