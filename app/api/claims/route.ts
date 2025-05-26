import { NextResponse } from "next/server"
import { convert837Professional } from "@/lib/edi-converter"

// This would be replaced with a real database in production
const claims = [
  {
    id: "CLM001",
    patientId: 1,
    providerId: 1,
    payerId: 1,
    diagnosisCode: "J01.90",
    serviceDate: "2025-05-21",
    status: "pending",
    amount: 125.0,
    createdAt: "2025-05-21T10:30:00Z",
    serviceLines: [
      { procedureCode: "99213", amount: "100.00", units: "1" },
      { procedureCode: "87070", amount: "25.00", units: "1" },
    ],
  },
  {
    id: "CLM002",
    patientId: 2,
    providerId: 1,
    payerId: 1,
    diagnosisCode: "E11.9",
    serviceDate: "2025-05-20",
    status: "approved",
    amount: 250.0,
    createdAt: "2025-05-20T14:15:00Z",
    serviceLines: [
      { procedureCode: "99214", amount: "150.00", units: "1" },
      { procedureCode: "82947", amount: "100.00", units: "1" },
    ],
  },
  {
    id: "CLM003",
    patientId: 3,
    providerId: 2,
    payerId: 2,
    diagnosisCode: "I10",
    serviceDate: "2025-05-19",
    status: "rejected",
    amount: 350.0,
    createdAt: "2025-05-19T09:45:00Z",
    serviceLines: [
      { procedureCode: "99215", amount: "200.00", units: "1" },
      { procedureCode: "93000", amount: "150.00", units: "1" },
    ],
  },
]

export async function GET() {
  return NextResponse.json(claims)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate the data (simplified for this example)
    if (!data.patientId || !data.providerId || !data.payerId || !data.diagnosisCode) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    // Generate a new claim ID
    const claimId = `CLM${String(claims.length + 1).padStart(3, "0")}`

    // Create the new claim
    const newClaim = {
      id: claimId,
      patientId: data.patientId,
      providerId: data.providerId,
      payerId: data.payerId,
      diagnosisCode: data.diagnosisCode,
      serviceDate: data.serviceDate,
      status: "pending",
      amount: data.serviceLines.reduce((total: number, line: any) => total + Number.parseFloat(line.amount), 0),
      createdAt: new Date().toISOString(),
      serviceLines: data.serviceLines,
    }

    // In a real app, you would save this to a database
    claims.push(newClaim)

    // Generate EDI file (simplified for this example)
    // In a real app, you would use more complete data
    const ediData = {
      submitter_id: "123456789",
      receiver_id: "987654321",
      transaction_date: new Date().toISOString().split("T")[0],
      transaction_time: new Date().toTimeString().slice(0, 4).replace(":", ""),
      claim_id: claimId,
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
      claim_number: claimId,
      claim_amount: newClaim.amount.toString(),
      diagnosis_code: data.diagnosisCode,
      service_lines: data.serviceLines,
    }

    const ediContent = convert837Professional(ediData)

    return NextResponse.json({
      claim: newClaim,
      ediContent,
    })
  } catch (error) {
    console.error("Error creating claim:", error)
    return NextResponse.json({ error: "Failed to create claim" }, { status: 500 })
  }
}
