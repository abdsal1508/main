"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Copy, RefreshCw } from "lucide-react"
import { convert837Professional } from "@/lib/edi-converter"
import { toast } from "@/hooks/use-toast"
import type { Claim } from "@/lib/database"

interface ClaimEdiViewerProps {
  claim: Claim
}

export function ClaimEdiViewer({ claim }: ClaimEdiViewerProps) {
  const [ediContent, setEdiContent] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  const generateEdi = () => {
    setIsGenerating(true)

    try {
      // Format the claim data for the EDI converter
      const ediData = {
        submitter_id: "123456789",
        receiver_id: "987654321",
        transaction_date: new Date().toISOString().split("T")[0],
        transaction_time: new Date().toTimeString().slice(0, 4).replace(":", ""),
        claim_id: claim.claim_number,
        submitter_name: "ABC SUBMITTER",
        contact_name: "JOHN CONTACT",
        contact_phone: "1234567890",
        receiver_name: claim.payer?.name || "XYZ PAYER",
        billing_provider: {
          name: claim.provider?.name || "ABC CLINIC",
          npi: claim.provider?.npi || "1234567893",
          address: claim.provider?.address || "456 HEALTH ST",
          city: claim.provider?.city || "HEALTHYVILLE",
          state: claim.provider?.state || "CA",
          zip: claim.provider?.zip_code || "90001",
          tax_id: claim.provider?.tax_id || "123456789",
        },
        subscriber: {
          first_name: claim.patient?.first_name || "JOHN",
          last_name: claim.patient?.last_name || "DOE",
          dob: claim.patient?.date_of_birth || "1980-01-15",
          gender: claim.patient?.gender || "M",
          address: claim.patient?.address || "123 MAIN ST",
          city: claim.patient?.city || "ANYTOWN",
          state: claim.patient?.state || "CA",
          zip: claim.patient?.zip_code || "90210",
          member_id: claim.patient?.member_id || "W123456789",
        },
        payer: {
          name: claim.payer?.name || "BLUE CROSS",
          id: claim.payer?.payer_code || "HP123456",
        },
        claim_number: claim.claim_number,
        claim_amount: claim.claim_amount.toString(),
        diagnosis_code: claim.diagnosis_code,
        service_lines:
          claim.service_lines?.map((line) => ({
            procedure_code: line.procedure_code,
            amount: line.amount.toString(),
            units: line.units.toString(),
          })) || [],
      }

      const edi = convert837Professional(ediData)
      setEdiContent(edi)
      toast({
        title: "EDI Generated",
        description: "The EDI file has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating EDI:", error)
      toast({
        title: "Error",
        description: "Failed to generate EDI file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ediContent)
    toast({
      title: "Copied",
      description: "EDI content copied to clipboard.",
    })
  }

  const downloadEdi = () => {
    const blob = new Blob([ediContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `claim_${claim.claim_number}.edi`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {!ediContent ? (
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <p className="text-center text-muted-foreground">
            Click the button below to generate an EDI file for this claim.
          </p>
          <Button onClick={generateEdi} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate EDI File</>
            )}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button size="sm" onClick={downloadEdi}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
          <Card>
            <CardContent className="p-4">
              <pre className="overflow-auto text-xs whitespace-pre-wrap bg-muted p-4 rounded-md max-h-[400px]">
                {ediContent}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
