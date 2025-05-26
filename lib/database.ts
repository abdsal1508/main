import { supabase } from "./supabase"

export interface Patient {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  member_id: string
  address: string
  city: string
  state: string
  zip_code: string
  phone?: string
  email?: string
  created_at: string
  updated_at: string
}

export interface Provider {
  id: string
  name: string
  npi: string
  tax_id: string
  address: string
  city: string
  state: string
  zip_code: string
  phone?: string
  email?: string
  created_at: string
  updated_at: string
}

export interface Payer {
  id: string
  name: string
  payer_code: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  phone?: string
  email?: string
  created_at: string
  updated_at: string
}

export interface Claim {
  id: string
  claim_number: string
  patient_id: string
  provider_id: string
  payer_id: string
  diagnosis_code: string
  diagnosis_description?: string
  claim_amount: number
  service_date: string
  status: string
  notes?: string
  edi_content?: string
  created_at: string
  updated_at: string
  patient?: Patient
  provider?: Provider
  payer?: Payer
  service_lines?: ServiceLine[]
}

export interface ServiceLine {
  id: string
  claim_id: string
  procedure_code: string
  procedure_description?: string
  amount: number
  units: number
  created_at: string
  updated_at: string
}

// Patient operations
export const patientService = {
  async getAll() {
    const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data as Patient[]
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("patients").select("*").eq("id", id).single()

    if (error) throw error
    return data as Patient
  },

  async create(patient: Omit<Patient, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("patients").insert([patient]).select().single()

    if (error) throw error
    return data as Patient
  },

  async update(id: string, patient: Partial<Patient>) {
    const { data, error } = await supabase
      .from("patients")
      .update({ ...patient, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Patient
  },

  async delete(id: string) {
    const { error } = await supabase.from("patients").delete().eq("id", id)

    if (error) throw error
  },
}

// Provider operations
export const providerService = {
  async getAll() {
    const { data, error } = await supabase.from("providers").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data as Provider[]
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("providers").select("*").eq("id", id).single()

    if (error) throw error
    return data as Provider
  },

  async create(provider: Omit<Provider, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("providers").insert([provider]).select().single()

    if (error) throw error
    return data as Provider
  },
}

// Payer operations
export const payerService = {
  async getAll() {
    const { data, error } = await supabase.from("payers").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data as Payer[]
  },

  async create(payer: Omit<Payer, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("payers").insert([payer]).select().single()

    if (error) throw error
    return data as Payer
  },
}

// Claim operations
export const claimService = {
  async getAll() {
    const { data, error } = await supabase
      .from("claims")
      .select(`
        *,
        patient:patients(*),
        provider:providers(*),
        payer:payers(*),
        service_lines(*)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Claim[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("claims")
      .select(`
        *,
        patient:patients(*),
        provider:providers(*),
        payer:payers(*),
        service_lines(*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Claim
  },

  async create(claim: Omit<Claim, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("claims").insert([claim]).select().single()

    if (error) throw error
    return data as Claim
  },

  async update(id: string, claim: Partial<Claim>) {
    const { data, error } = await supabase
      .from("claims")
      .update({ ...claim, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Claim
  },

  async getStats() {
    const { data: totalClaims, error: totalError } = await supabase.from("claims").select("id", { count: "exact" })

    const { data: pendingClaims, error: pendingError } = await supabase
      .from("claims")
      .select("id", { count: "exact" })
      .eq("status", "pending")

    const { data: approvedClaims, error: approvedError } = await supabase
      .from("claims")
      .select("id", { count: "exact" })
      .eq("status", "approved")

    const { data: rejectedClaims, error: rejectedError } = await supabase
      .from("claims")
      .select("id", { count: "exact" })
      .eq("status", "rejected")

    if (totalError || pendingError || approvedError || rejectedError) {
      throw new Error("Failed to fetch claim statistics")
    }

    return {
      total: totalClaims?.length || 0,
      pending: pendingClaims?.length || 0,
      approved: approvedClaims?.length || 0,
      rejected: rejectedClaims?.length || 0,
    }
  },
}

// Service line operations
export const serviceLineService = {
  async createMultiple(serviceLines: Omit<ServiceLine, "id" | "created_at" | "updated_at">[]) {
    const { data, error } = await supabase.from("service_lines").insert(serviceLines).select()

    if (error) throw error
    return data as ServiceLine[]
  },

  async deleteByClaimId(claimId: string) {
    const { error } = await supabase.from("service_lines").delete().eq("claim_id", claimId)

    if (error) throw error
  },
}
