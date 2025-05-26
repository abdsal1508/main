// This is a Node.js implementation of the JSON to EDI 837 converter
// It can be used to test the EDI generation functionality

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toISOString().slice(0, 10).replace(/-/g, "")
}

function convert837Professional(jsonData) {
  const edi = []

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

// Example JSON data
const exampleData = {
  submitter_id: "123456789",
  receiver_id: "987654321",
  transaction_date: "2025-05-22",
  transaction_time: "1200",
  claim_id: "C0001",
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
  claim_number: "CLM001",
  claim_amount: "125.00",
  diagnosis_code: "J01.90",
  service_lines: [
    {
      procedure_code: "99213",
      amount: "100.00",
      units: "1",
    },
    {
      procedure_code: "87070",
      amount: "25.00",
      units: "1",
    },
  ],
}

// Generate the EDI file
const ediContent = convert837Professional(exampleData)
console.log("Generated EDI 837 File:")
console.log(ediContent)

// Example of parsing a 277 response (simplified)
function parse277Response(ediContent) {
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

// Example 277 response
const example277 = `ST*277*0001*005010X212
BHT*0085*08*277Response*20250522*1200
HL*1**20*1
NM1*PR*2*BLUE CROSS*****PI*HP123456
TRN*1*CLM001*1234567890
STC*A1:19:PR*20250522*WQ
SE*7*0001`

const response = parse277Response(example277)
console.log("\nParsed 277 Response:")
console.log(response)
