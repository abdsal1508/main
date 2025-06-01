"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { convert837Professional } from "@/lib/edi-converter"
import { Download, Copy, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ClaimEdiGeneratorProps {
  claimData: any
}

export function ClaimEdiGenerator({ claimData }: ClaimEdiGeneratorProps) {
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
        claim_id: claimData.id,
        submitter_name: "ABC SUBMITTER",
        contact_name: "JOHN CONTACT",
        contact_phone: "1234567890",
        receiver_name: "XYZ PAYER",
        billing_provider: {
          name: "ABC CLINIC",
          npi: "1234567893",
          address: "456 HEALTH ST",
          city: "HEALTHYVILLE",
          state: "CA",
          zip: "90001",
          tax_id: "123456789",
        },
        subscriber: {
          first_name: "JOHN",
          last_name: "DOE",
          dob: "1980-01-15",
          gender: "M",
          address: "123 MAIN ST",
          city: "ANYTOWN",
          state: "CA",
          zip: "90210",
          member_id: "W123456789",
        },
        payer: {
          name: "BLUE CROSS",
          id: "HP123456",
        },
        claim_number: claimData.id,
        claim_amount: claimData.amount.toString(),
        diagnosis_code: claimData.diagnosisCode,
        service_lines: claimData.serviceLines,
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
    a.download = `claim_${claimData.id}.edi`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>EDI Generator</CardTitle>
        <CardDescription>Generate an ANSI X12 837 EDI file for this claim.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ediContent ? (
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
            <Textarea className="font-mono text-xs h-[400px]" value={ediContent} readOnly />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <p className="text-center text-muted-foreground">
              Click the button below to generate an EDI file for this claim.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={generateEdi} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>Generate EDI File</>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
