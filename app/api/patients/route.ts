import { NextResponse } from "next/server"

// This would be replaced with a real database in production
const patients = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    dob: "1980-01-15",
    gender: "M",
    memberId: "W123456789",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "90210",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    dob: "1975-05-22",
    gender: "F",
    memberId: "W987654321",
    address: "456 Elm St",
    city: "Anytown",
    state: "CA",
    zip: "90210",
  },
  {
    id: 3,
    firstName: "Robert",
    lastName: "Johnson",
    dob: "1990-11-30",
    gender: "M",
    memberId: "W456789123",
    address: "789 Oak St",
    city: "Anytown",
    state: "CA",
    zip: "90210",
  },
]

export async function GET() {
  return NextResponse.json(patients)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate the data (simplified for this example)
    if (!data.firstName || !data.lastName || !data.dob || !data.gender || !data.memberId) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    // Check if member ID already exists
    if (patients.some((p) => p.memberId === data.memberId)) {
      return NextResponse.json({ error: "Member ID already exists" }, { status: 400 })
    }

    // Create the new patient
    const newPatient = {
      id: patients.length + 1,
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob,
      gender: data.gender,
      memberId: data.memberId,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
    }

    // In a real app, you would save this to a database
    patients.push(newPatient)

    return NextResponse.json(newPatient)
  } catch (error) {
    console.error("Error creating patient:", error)
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}
