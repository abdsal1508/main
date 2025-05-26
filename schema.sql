-- Database Schema for ProCentric Healthcare Claims System

-- Patients Table
CREATE TABLE patients (
  patient_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  dob DATE NOT NULL,
  gender CHAR(1) NOT NULL,
  member_id VARCHAR(50) UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Providers Table
CREATE TABLE providers (
  provider_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  npi VARCHAR(20) UNIQUE NOT NULL,
  tax_id VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payers Table (Insurance Companies)
CREATE TABLE payers (
  payer_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  payer_code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  zip VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claims Table
CREATE TABLE claims (
  claim_id SERIAL PRIMARY KEY,
  claim_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id INT REFERENCES patients(patient_id),
  provider_id INT REFERENCES providers(provider_id),
  payer_id INT REFERENCES payers(payer_id),
  diagnosis_code VARCHAR(20) NOT NULL,
  claim_amount DECIMAL(10,2) NOT NULL,
  service_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Lines Table
CREATE TABLE service_lines (
  line_id SERIAL PRIMARY KEY,
  claim_id INT REFERENCES claims(claim_id) ON DELETE CASCADE,
  procedure_code VARCHAR(20) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  units INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EDI Files Table
CREATE TABLE edi_files (
  file_id SERIAL PRIMARY KEY,
  claim_id INT REFERENCES claims(claim_id),
  file_type VARCHAR(10) NOT NULL, -- 837, 277, 835
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claim Status History Table
CREATE TABLE claim_status_history (
  history_id SERIAL PRIMARY KEY,
  claim_id INT REFERENCES claims(claim_id),
  status VARCHAR(20) NOT NULL,
  notes TEXT,
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL, -- admin, provider, staff
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table
CREATE TABLE audit_logs (
  log_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- patient, claim, provider, etc.
  entity_id INT NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_claims_patient_id ON claims(patient_id);
CREATE INDEX idx_claims_provider_id ON claims(provider_id);
CREATE INDEX idx_claims_payer_id ON claims(payer_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_service_lines_claim_id ON service_lines(claim_id);
CREATE INDEX idx_claim_status_history_claim_id ON claim_status_history(claim_id);
CREATE INDEX idx_edi_files_claim_id ON edi_files(claim_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
