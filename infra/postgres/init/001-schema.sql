CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('ADMIN', 'STAFF', 'CUSTOMER')),
  customer_id uuid UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES users(id),
  name text NOT NULL,
  email citext NOT NULL UNIQUE,
  phone text,
  company text,
  address jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ADD CONSTRAINT users_customer_fk FOREIGN KEY (customer_id) REFERENCES customers(id);

CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_by uuid REFERENCES users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  sales_price numeric(12,2) NOT NULL CHECK (sales_price >= 0),
  cost_price numeric(12,2) NOT NULL CHECK (cost_price >= 0),
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_name text NOT NULL,
  attribute_value text NOT NULL,
  extra_price numeric(12,2) NOT NULL DEFAULT 0 CHECK (extra_price >= 0),
  UNIQUE (product_id, attribute_name, attribute_value)
);

CREATE TABLE plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  name text NOT NULL,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  billing_period text NOT NULL CHECK (billing_period IN ('DAILY','WEEKLY','MONTHLY','YEARLY')),
  minimum_quantity integer NOT NULL CHECK (minimum_quantity > 0),
  available_from date,
  available_to date,
  auto_close_on_end boolean NOT NULL DEFAULT false,
  closable boolean NOT NULL DEFAULT false,
  pausable boolean NOT NULL DEFAULT false,
  renewable boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  CHECK (available_to IS NULL OR available_from IS NULL OR available_to >= available_from)
);

CREATE TABLE taxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rate numeric(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100),
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE product_taxes (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tax_id uuid NOT NULL REFERENCES taxes(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tax_id)
);

CREATE TABLE discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('FIXED','PERCENTAGE')),
  value numeric(12,2) NOT NULL CHECK (value >= 0),
  minimum_purchase numeric(12,2),
  minimum_quantity integer,
  applies_to text NOT NULL CHECK (applies_to IN ('SUBSCRIPTION','PRODUCTS')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  usage_limit integer,
  usage_count integer NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1,
  CHECK (ends_at >= starts_at),
  CHECK (usage_limit IS NULL OR usage_count <= usage_limit)
);

CREATE TABLE discount_products (
  discount_id uuid NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (discount_id, product_id)
);

CREATE TABLE quotation_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  plan_id uuid REFERENCES plans(id),
  validity_days integer NOT NULL CHECK (validity_days > 0),
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE quotation_template_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES quotation_templates(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  product_variant_id uuid REFERENCES product_variants(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  position integer NOT NULL,
  UNIQUE (template_id, position)
);

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES customers(id),
  plan_id uuid NOT NULL REFERENCES plans(id),
  template_id uuid REFERENCES quotation_templates(id),
  start_date date NOT NULL,
  end_date date,
  payment_terms text,
  status text NOT NULL CHECK (status IN ('DRAFT','QUOTATION','CONFIRMED','ACTIVE','PAUSED','CLOSED')),
  next_billing_date date,
  paused_at timestamptz,
  closed_at timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE subscription_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  product_variant_id uuid REFERENCES product_variants(id),
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  tax_rate numeric(5,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0)
);

CREATE TABLE subscription_status_events (
  id bigserial PRIMARY KEY,
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  reason text,
  actor_id uuid REFERENCES users(id),
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  subscription_id uuid NOT NULL REFERENCES subscriptions(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  status text NOT NULL CHECK (status IN ('DRAFT','CONFIRMED','PAID','CANCELLED')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  issued_at timestamptz,
  due_at date NOT NULL,
  subtotal numeric(12,2) NOT NULL CHECK (subtotal >= 0),
  tax_total numeric(12,2) NOT NULL DEFAULT 0 CHECK (tax_total >= 0),
  discount_total numeric(12,2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
  total numeric(12,2) NOT NULL CHECK (total >= 0),
  paid_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subscription_id, period_start, period_end),
  CHECK (period_end >= period_start)
);

CREATE TABLE invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  product_variant_id uuid REFERENCES product_variants(id),
  description text NOT NULL,
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  tax_rate numeric(5,2),
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  discount_amount numeric(12,2) NOT NULL DEFAULT 0,
  discount_reason text,
  line_total numeric(12,2) NOT NULL
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id),
  method text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  payment_date timestamptz NOT NULL,
  note text,
  external_reference text,
  recorded_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE billing_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date date NOT NULL,
  started_by uuid REFERENCES users(id),
  status text NOT NULL CHECK (status IN ('RUNNING','COMPLETED','FAILED')),
  dry_run boolean NOT NULL DEFAULT false,
  created_count integer NOT NULL DEFAULT 0,
  skipped_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  duration_ms integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id bigserial PRIMARY KEY,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  from_status text,
  to_status text,
  actor_id uuid REFERENCES users(id),
  metadata jsonb NOT NULL DEFAULT '{}',
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id),
  type text NOT NULL,
  recipient_email text NOT NULL,
  template text NOT NULL,
  overdue_day integer NOT NULL CHECK (overdue_day IN (1,7,14)),
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (invoice_id, overdue_day)
);

CREATE TABLE dashboard_metrics (
  metric text PRIMARY KEY,
  value numeric(20,2) NOT NULL DEFAULT 0,
  refreshed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX subscriptions_customer_idx ON subscriptions(customer_id);
CREATE INDEX subscriptions_status_billing_idx ON subscriptions(status, next_billing_date);
CREATE INDEX invoices_customer_status_due_idx ON invoices(customer_id, status, due_at);
CREATE INDEX invoices_period_idx ON invoices(subscription_id, period_start, period_end);
CREATE INDEX payments_invoice_idx ON payments(invoice_id);
CREATE INDEX audit_entity_idx ON audit_events(entity_type, entity_id, occurred_at DESC);
CREATE INDEX notifications_invoice_day_idx ON notifications(invoice_id, overdue_day);
