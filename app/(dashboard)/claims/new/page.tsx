"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ServiceLineForm } from "@/components/service-line-form"
import { toast } from "@/hooks/use-toast"
import {
  patientService,
  providerService,
  payerService,
  claimService,
  serviceLineService,
  type Patient,
  type Provider,
  type Payer,
} from "@/lib/database"
// Add ProtectedRoute wrapper
import { ProtectedRoute } from "@/components/protected-route"

const claimFormSchema = z.object({
  patientId: z.string().min(1, { message: "Please select a patient" }),
  providerId: z.string().min(1, { message: "Please select a provider" }),
  payerId: z.string().min(1, { message: "Please select a payer" }),
  diagnosisCode: z.string().min(1, { message: "Diagnosis code is required" }),
  diagnosisDescription: z.string().optional(),
  serviceDate: z.string().min(1, { message: "Service date is required" }),
  notes: z.string().optional(),
})

type ClaimFormValues = z.infer<typeof claimFormSchema>

interface ServiceLineData {
  id: number
  procedureCode: string
  procedureDescription: string
  amount: string
  units: string
}

export default function NewClaimPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [payers, setPayers] = useState<Payer[]>([])
  const [serviceLines, setServiceLines] = useState<ServiceLineData[]>([
    { id: 1, procedureCode: "", procedureDescription: "", amount: "", units: "1" },
  ])
  const [loading, setLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState("claim-info")

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      patientId: "",
      providerId: "",
      payerId: "",
      diagnosisCode: "",
      diagnosisDescription: "",
      serviceDate: "",
      notes: "",
    },
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [patientsData, providersData, payersData] = await Promise.all([
          patientService.getAll(),
          providerService.getAll(),
          payerService.getAll(),
        ])
        setPatients(patientsData)
        setProviders(providersData)
        setPayers(payersData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load form data. Please refresh the page.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [])

  async function onSubmit(data: ClaimFormValues) {
    setLoading(true)
    try {
      // Calculate total amount
      const totalAmount = serviceLines.reduce((sum, line) => sum + Number.parseFloat(line.amount || "0"), 0)

      // Generate claim number
      const claimNumber = `CLM${Date.now().toString().slice(-6)}`

      // Create claim
      const claim = await claimService.create({
        claim_number: claimNumber,
        patient_id: data.patientId,
        provider_id: data.providerId,
        payer_id: data.payerId,
        diagnosis_code: data.diagnosisCode,
        diagnosis_description: data.diagnosisDescription,
        claim_amount: totalAmount,
        service_date: data.serviceDate,
        status: "pending",
        notes: data.notes,
      })

      // Create service lines
      const serviceLineData = serviceLines
        .filter((line) => line.procedureCode && line.amount)
        .map((line) => ({
          claim_id: claim.id,
          procedure_code: line.procedureCode,
          procedure_description: line.procedureDescription,
          amount: Number.parseFloat(line.amount),
          units: Number.parseInt(line.units) || 1,
        }))

      if (serviceLineData.length > 0) {
        await serviceLineService.createMultiple(serviceLineData)
      }

      toast({
        title: "Claim submitted",
        description: `Claim ${claimNumber} has been submitted successfully.`,
      })

      router.push(`/claims/${claim.id}`)
    } catch (error) {
      console.error("Error creating claim:", error)
      toast({
        title: "Error",
        description: "Failed to submit claim. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addServiceLine = () => {
    setServiceLines([
      ...serviceLines,
      {
        id: serviceLines.length + 1,
        procedureCode: "",
        procedureDescription: "",
        amount: "",
        units: "1",
      },
    ])
  }

  const removeServiceLine = (id: number) => {
    if (serviceLines.length > 1) {
      setServiceLines(serviceLines.filter((line) => line.id !== id))
    }
  }

  const updateServiceLine = (id: number, field: string, value: string) => {
    setServiceLines(serviceLines.map((line) => (line.id === id ? { ...line, [field]: value } : line)))
  }

  return (
    <ProtectedRoute>
      <DashboardShell>
        <DashboardHeader heading="Submit New Claim" text="Create and submit a new insurance claim.">
          <Link href="/claims">
            <Button variant="outline">Cancel</Button>
          </Link>
        </DashboardHeader>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="claim-info">Claim Information</TabsTrigger>
            <TabsTrigger value="service-lines">Service Lines</TabsTrigger>
            <TabsTrigger value="review">Review & Submit</TabsTrigger>
          </TabsList>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TabsContent value="claim-info">
                <Card>
                  <CardHeader>
                    <CardTitle>Claim Information</CardTitle>
                    <CardDescription>Enter the basic information for this claim.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="patientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {patients.map((patient) => (
                                  <SelectItem key={patient.id} value={patient.id}>
                                    {patient.first_name} {patient.last_name} - {patient.member_id}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="providerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provider</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {providers.map((provider) => (
                                  <SelectItem key={provider.id} value={provider.id}>
                                    {provider.name} - {provider.npi}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="payerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payer</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {payers.map((payer) => (
                                  <SelectItem key={payer.id} value={payer.id}>
                                    {payer.name} - {payer.payer_code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="serviceDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="diagnosisCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diagnosis Code (ICD-10)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. J01.90" {...field} />
                            </FormControl>
                            <FormDescription>Enter the primary ICD-10 diagnosis code.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="diagnosisDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diagnosis Description</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Acute sinusitis, unspecified" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional notes about this claim" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href="/claims">
                      <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button type="button" onClick={() => setCurrentTab("service-lines")}>
                      Next
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="service-lines">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Lines</CardTitle>
                    <CardDescription>Add the services provided to the patient.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {serviceLines.map((line) => (
                      <ServiceLineForm
                        key={line.id}
                        id={line.id}
                        procedureCode={line.procedureCode}
                        procedureDescription={line.procedureDescription}
                        amount={line.amount}
                        units={line.units}
                        onUpdate={updateServiceLine}
                        onRemove={removeServiceLine}
                        canRemove={serviceLines.length > 1}
                      />
                    ))}
                    <Button type="button" variant="outline" onClick={addServiceLine}>
                      Add Service Line
                    </Button>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentTab("claim-info")}>
                      Previous
                    </Button>
                    <Button type="button" onClick={() => setCurrentTab("review")}>
                      Next
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="review">
                <Card>
                  <CardHeader>
                    <CardTitle>Review & Submit</CardTitle>
                    <CardDescription>Review your claim information before submission.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-md border p-4">
                      <h3 className="font-medium">Claim Summary</h3>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="text-sm">Patient:</div>
                        <div className="text-sm font-medium">
                          {patients.find((p) => p.id === form.getValues("patientId"))?.first_name}{" "}
                          {patients.find((p) => p.id === form.getValues("patientId"))?.last_name}
                        </div>
                        <div className="text-sm">Provider:</div>
                        <div className="text-sm font-medium">
                          {providers.find((p) => p.id === form.getValues("providerId"))?.name}
                        </div>
                        <div className="text-sm">Payer:</div>
                        <div className="text-sm font-medium">
                          {payers.find((p) => p.id === form.getValues("payerId"))?.name}
                        </div>
                        <div className="text-sm">Diagnosis:</div>
                        <div className="text-sm font-medium">{form.getValues("diagnosisCode")}</div>
                        <div className="text-sm">Service Date:</div>
                        <div className="text-sm font-medium">{form.getValues("serviceDate")}</div>
                      </div>
                      <h3 className="mt-4 font-medium">Service Lines</h3>
                      <div className="mt-2">
                        <div className="grid grid-cols-4 gap-2 font-medium text-sm">
                          <div>Procedure</div>
                          <div>Description</div>
                          <div>Amount</div>
                          <div>Units</div>
                        </div>
                        {serviceLines
                          .filter((line) => line.procedureCode && line.amount)
                          .map((line) => (
                            <div key={line.id} className="grid grid-cols-4 gap-2 text-sm mt-1">
                              <div>{line.procedureCode}</div>
                              <div>{line.procedureDescription || "N/A"}</div>
                              <div>${line.amount}</div>
                              <div>{line.units}</div>
                            </div>
                          ))}
                        <div className="mt-2 pt-2 border-t">
                          <div className="grid grid-cols-4 gap-2 font-medium text-sm">
                            <div className="col-span-2">Total:</div>
                            <div>
                              $
                              {serviceLines
                                .reduce((sum, line) => sum + Number.parseFloat(line.amount || "0"), 0)
                                .toFixed(2)}
                            </div>
                            <div></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentTab("service-lines")}>
                      Previous
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Claim"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </DashboardShell>
    </ProtectedRoute>
  )
}
