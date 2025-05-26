// Convert the Python script to TypeScript for our Next.js environment

interface Provider {
  name: string
  npi: string
  address: string
  city: string
  state: string
  zip: string
  tax_id: string
}

interface Subscriber {
  first_name: string
  last_name: string
  dob: string
  gender: string
  address: string
  city: string
  state: string
  zip: string
  member_id: string
}

interface Payer {
  name: string
  id: string
}

interface ServiceLine {
  procedure_code: string
  amount: string
  units: string
}

interface ClaimData {
  submitter_id: string
  receiver_id: string
  transaction_date: string
  transaction_time: string
  claim_id: string
  submitter_name: string
  contact_name: string
  contact_phone: string
  receiver_name: string
  billing_provider: Provider
  subscriber: Subscriber
  payer: Payer
  claim_number: string
  claim_amount: string
  diagnosis_code: string
  service_lines: ServiceLine[]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toISOString().slice(0, 10).replace(/-/g, "")
}

export function convert837Professional(jsonData: ClaimData): string {
  const edi: string[] = []

  // ISA and GS headers with formatted dates
  edi.push(
    `ISA*00*          *00*          *ZZ*${jsonData.submitter_id.padEnd(15)}*ZZ*${jsonData.receiver_id.padEnd(15)}*${formatDate(jsonData.transaction_date).substring(2)}*${jsonData.transaction_time}*^*00501*000000905*0*T*:~`,
  )
  edi.push(
    `GS*HC*${jsonData.submitter_id}*${jsonData.receiver_id}*${formatDate(jsonData.transaction_date)}*${jsonData.transaction_time}*1*X*005010X222A1~`,
  )
  edi.push(`ST*837*0001*005010X222A1~`)
  edi.push(`BHT*0019*00*${jsonData.claim_id}*${formatDate(jsonData.transaction_date)}*${jsonData.transaction_time}*CH~`)

  // Submitter Info
  edi.push(`NM1*41*2*${jsonData.submitter_name}*****46*${jsonData.submitter_id}~`)
  edi.push(`PER*IC*${jsonData.contact_name}*TE*${jsonData.contact_phone}~`)

  // Receiver
  edi.push(`NM1*40*2*${jsonData.receiver_name}*****46*${jsonData.receiver_id}~`)

  // Billing Provider
  edi.push(`HL*1**20*1~`)
  edi.push(`NM1*85*2*${jsonData.billing_provider.name}*****XX*${jsonData.billing_provider.npi}~`)
  edi.push(`N3*${jsonData.billing_provider.address}~`)
  edi.push(`N4*${jsonData.billing_provider.city}*${jsonData.billing_provider.state}*${jsonData.billing_provider.zip}~`)
  edi.push(`REF*EI*${jsonData.billing_provider.tax_id}~`)

  // Subscriber
  edi.push(`HL*2*1*22*0~`)
  edi.push(`SBR*P*18*******MC~`)
  edi.push(
    `NM1*IL*1*${jsonData.subscriber.last_name}*${jsonData.subscriber.first_name}****MI*${jsonData.subscriber.member_id}~`,
  )
  edi.push(`N3*${jsonData.subscriber.address}~`)
  edi.push(`N4*${jsonData.subscriber.city}*${jsonData.subscriber.state}*${jsonData.subscriber.zip}~`)
  edi.push(`DMG*D8*${formatDate(jsonData.subscriber.dob)}*${jsonData.subscriber.gender}~`)

  // Payer
  edi.push(`NM1*PR*2*${jsonData.payer.name}*****PI*${jsonData.payer.id}~`)

  // Claim
  edi.push(`CLM*${jsonData.claim_number}*${jsonData.claim_amount}***11:B:1*Y*A*Y*I~`)
  edi.push(`HI*ABK:${jsonData.diagnosis_code}~`)

  // Service Lines
  jsonData.service_lines.forEach((line, i) => {
    edi.push(`LX*${i + 1}~`)
    edi.push(`SV1*HC:${line.procedure_code}*${line.amount}*UN*${line.units}***1~`)
  })

  // Trailers
  edi.push(`SE*${edi.length + 2}*0001~`)
  edi.push(`GE*1*1~`)
  edi.push(`IEA*1*000000905~`)

  return edi.join("\n")
}

// Function to parse 277 response files
export function parse277Response(ediContent: string): any {
  // This is a simplified parser for demonstration
  // In a real app, you would need a more robust parser
  const segments = ediContent.split("~").map((s) => s.trim())
  const response = {
    claimId: "",
    status: "",
    statusDate: "",
    statusReason: "",
  }

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i].split("*")
    if (segment[0] === "TRN") {
      response.claimId = segment[2] || ""
    } else if (segment[0] === "STC") {
      const statusInfo = segment[1].split(":")
      response.status = statusInfo[0] || ""
      response.statusReason = statusInfo[1] || ""
      response.statusDate = segment[2] || ""
    }
  }

  return response
}

// Function to parse 835 payment files
export function parse835Payment(ediContent: string): any {
  // This is a simplified parser for demonstration
  // In a real app, you would need a more robust parser
  const segments = ediContent.split("~").map((s) => s.trim())
  const payment = {
    claimId: "",
    totalAmount: "",
    paidAmount: "",
    patientResponsibility: "",
    adjustments: [],
  }

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i].split("*")
    if (segment[0] === "CLP") {
      payment.claimId = segment[1] || ""
      payment.totalAmount = segment[3] || ""
      payment.paidAmount = segment[4] || ""
      payment.patientResponsibility = segment[5] || ""
    } else if (segment[0] === "CAS") {
      payment.adjustments.push({
        group: segment[1],
        code: segment[2],
        amount: segment[3],
      })
    }
  }

  return payment
}
