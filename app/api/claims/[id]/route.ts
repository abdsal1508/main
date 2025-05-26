import { NextResponse } from "next/server"

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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const claim = claims.find((c) => c.id === params.id)

  if (!claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 })
  }

  return NextResponse.json(claim)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const index = claims.findIndex((c) => c.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 })
    }

    // Update the claim
    claims[index] = {
      ...claims[index],
      ...data,
      // Don't allow changing the ID
      id: params.id,
    }

    return NextResponse.json(claims[index])
  } catch (error) {
    console.error("Error updating claim:", error)
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const index = claims.findIndex((c) => c.id === params.id)

  if (index === -1) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 })
  }

  // Remove the claim
  claims.splice(index, 1)

  return NextResponse.json({ success: true })
}
