
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT UNIQUE,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_seen_notif_at TIMESTAMPTZ
);

-- 2) Users (tenant users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  role TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3) Centralized Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT,
  message TEXT,
  type TEXT,          -- e.g., "invoice", "onboarding", "transfer", "admin"
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  metadata JSONB
);

-- 4) Invoices (example; adjust to your needs)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_prefix TEXT NOT NULL,   -- 3-digit
  invoice_suffix TEXT NOT NULL,   -- 6-char
  invoice_id TEXT UNIQUE,
  owner_tenant_id UUID REFERENCES tenants(id),
  amount NUMERIC,
  currency TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5) Transfers (Tenant-to-Tenant)
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_tenant_id UUID REFERENCES tenants(id),
  to_tenant_id UUID REFERENCES tenants(id),
  amount NUMERIC,
  currency TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
