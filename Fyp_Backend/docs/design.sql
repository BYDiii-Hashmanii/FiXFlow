-- =====================================================================
-- FixFlow database schema (PostgreSQL 16, 17, 18 or 19)
-- Roles: customer, technician, owner (company owner)
--
-- How to run:
--   1. In pgAdmin create a database named  fixflow
--   2. Open Query Tool on that database, paste this file, press F5
--   or from the terminal:
--      psql -U postgres -d fixflow -f fixflow_schema.sql
--
-- Sections:  1 Extensions   2 Enum types   3 Tables   4 Indexes
--            5 Triggers     6 Views        7 Sample data (optional)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- used only for seed password hashes


-- ---------------------------------------------------------------------
-- 2. ENUM TYPES  (exact values must match the Angular enums)
-- ---------------------------------------------------------------------
CREATE TYPE user_role           AS ENUM ('customer', 'technician', 'owner');
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'unavailable');
CREATE TYPE urgency_level       AS ENUM ('low', 'medium', 'high');
CREATE TYPE booking_mode        AS ENUM ('auto', 'manual');
CREATE TYPE request_status      AS ENUM (
    'ai_analysis',        -- customer reported, AI result shown
    'solved_by_customer', -- customer fixed it using AI steps
    'waiting',            -- offer sent, waiting for technician
    'accepted',           -- technician accepted
    'in_progress',        -- work started
    'completed',          -- work done, invoice sent
    'closed_paid',        -- customer paid, job closed
    'cancelled'
);
CREATE TYPE offer_status        AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE decline_reason      AS ENUM ('busy', 'not_available', 'outside_area', 'other');
CREATE TYPE job_status          AS ENUM ('accepted', 'in_progress', 'completed', 'closed');
CREATE TYPE invoice_status      AS ENUM ('draft', 'unpaid', 'paid');
CREATE TYPE photo_type          AS ENUM ('before', 'after', 'progress');
CREATE TYPE notification_type   AS ENUM ('request', 'offer', 'job', 'invoice', 'payment', 'feedback', 'system');


-- ---------------------------------------------------------------------
-- 3. TABLES
-- ---------------------------------------------------------------------

-- 3.1 users: one login table for all three roles
CREATE TABLE users (
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name      VARCHAR(100) NOT NULL,
    phone          VARCHAR(20)  NOT NULL UNIQUE,          -- stored as +923001234567
    email          VARCHAR(150) UNIQUE,                   -- optional for customers
    password_hash  TEXT         NOT NULL,                 -- bcrypt hash, never plain text
    role           user_role    NOT NULL,
    address        VARCHAR(255),
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,    -- deactivate instead of deleting
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_users_phone CHECK (phone ~ '^\+?[0-9]{10,15}$')
);

-- 3.2 companies: each company is managed by one owner
CREATE TABLE companies (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id    INTEGER      NOT NULL UNIQUE REFERENCES users(id),
    name        VARCHAR(120) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 3.3 service_categories: Plumbing, Electrical, ...
CREATE TABLE service_categories (
    id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name  VARCHAR(50) NOT NULL UNIQUE
);

-- 3.4 technicians: extra profile for users whose role = 'technician'
CREATE TABLE technicians (
    user_id       INTEGER PRIMARY KEY REFERENCES users(id),
    company_id    INTEGER NOT NULL REFERENCES companies(id),
    category_id   INTEGER NOT NULL REFERENCES service_categories(id),
    service_rate  NUMERIC(10,2) NOT NULL CHECK (service_rate > 0),   -- Rs per visit
    availability  availability_status NOT NULL DEFAULT 'available'
);

-- Request / invoice numbers: FF-0142 and INV-2026-0142
CREATE SEQUENCE request_no_seq START 1;
CREATE SEQUENCE invoice_no_seq START 1;

-- 3.5 service_requests: a problem reported by a customer
CREATE TABLE service_requests (
    id                      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_no              VARCHAR(20) NOT NULL UNIQUE
                            DEFAULT ('FF-' || lpad(nextval('request_no_seq')::text, 4, '0')),
    customer_id             INTEGER NOT NULL REFERENCES users(id),
    category_id             INTEGER NOT NULL REFERENCES service_categories(id),
    title                   VARCHAR(120),                     -- e.g. Kitchen Sink Leakage
    description             TEXT,
    photo_path              VARCHAR(255),                     -- file path, not the image itself
    address                 VARCHAR(255),
    access_time             TIMESTAMPTZ,
    urgency                 urgency_level,                    -- filled after AI analysis
    booking_mode            booking_mode,                     -- auto or manual
    assigned_technician_id  INTEGER REFERENCES technicians(user_id),  -- NULL until accepted
    status                  request_status NOT NULL DEFAULT 'ai_analysis',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.6 ai_analyses: result returned by the AI service (one per request)
CREATE TABLE ai_analyses (
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id     INTEGER NOT NULL UNIQUE REFERENCES service_requests(id) ON DELETE CASCADE,
    problem_title  VARCHAR(120) NOT NULL,
    summary        TEXT,
    urgency        urgency_level NOT NULL,
    safety_note    TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.7 ai_repair_steps: ordered safe repair instructions
CREATE TABLE ai_repair_steps (
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    analysis_id  INTEGER NOT NULL REFERENCES ai_analyses(id) ON DELETE CASCADE,
    step_no      SMALLINT NOT NULL CHECK (step_no > 0),
    instruction  TEXT NOT NULL,
    UNIQUE (analysis_id, step_no)
);

-- 3.8 request_offers: a request sent to a technician (handles decline branch)
CREATE TABLE request_offers (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id      INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    technician_id   INTEGER NOT NULL REFERENCES technicians(user_id),
    quoted_price    NUMERIC(10,2) NOT NULL CHECK (quoted_price >= 0),
    status          offer_status NOT NULL DEFAULT 'pending',
    decline_reason  decline_reason,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at    TIMESTAMPTZ,
    UNIQUE (request_id, technician_id),
    CONSTRAINT chk_offer_decline_reason
        CHECK ((status = 'declined') = (decline_reason IS NOT NULL))
);

-- 3.9 jobs: created when a technician accepts an offer
CREATE TABLE jobs (
    id                   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id           INTEGER NOT NULL UNIQUE REFERENCES service_requests(id),
    technician_id        INTEGER NOT NULL REFERENCES technicians(user_id),
    status               job_status NOT NULL DEFAULT 'accepted',
    accepted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at           TIMESTAMPTZ,
    expected_completion  TIMESTAMPTZ,
    completed_at         TIMESTAMPTZ,
    closed_at            TIMESTAMPTZ,
    labour_hours         NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (labour_hours >= 0),
    labour_cost          NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (labour_cost >= 0),
    work_notes           TEXT,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.10 job_parts: parts used in a job
CREATE TABLE job_parts (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id      INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    part_name   VARCHAR(120) NOT NULL,
    quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price  NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0)
);

-- 3.11 job_photos: before / after / progress photos
CREATE TABLE job_photos (
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id       INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    photo_type   photo_type NOT NULL DEFAULT 'progress',
    photo_path   VARCHAR(255) NOT NULL,
    uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.12 invoices: one per job, sent directly by the technician
CREATE TABLE invoices (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_no    VARCHAR(20) NOT NULL UNIQUE
                  DEFAULT ('INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_no_seq')::text, 4, '0')),
    job_id        INTEGER NOT NULL UNIQUE REFERENCES jobs(id),
    parts_total   NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (parts_total >= 0),
    labour_total  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (labour_total >= 0),
    total_amount  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    status        invoice_status NOT NULL DEFAULT 'draft',
    sent_at       TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_invoice_total CHECK (total_amount = parts_total + labour_total)
);

-- 3.13 payments: customer payment for an invoice
CREATE TABLE payments (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id      INTEGER NOT NULL UNIQUE REFERENCES invoices(id),
    customer_id     INTEGER NOT NULL REFERENCES users(id),
    amount          NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_method  VARCHAR(30) NOT NULL DEFAULT 'cash'
                    CHECK (payment_method IN ('cash', 'card', 'jazzcash', 'easypaisa', 'bank_transfer')),
    paid_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.14 reviews: customer feedback after payment (Skip = no row)
CREATE TABLE reviews (
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id         INTEGER NOT NULL UNIQUE REFERENCES jobs(id),
    customer_id    INTEGER NOT NULL REFERENCES users(id),
    technician_id  INTEGER NOT NULL REFERENCES technicians(user_id),
    rating         SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment        TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.15 notifications: in-app notifications for every role
CREATE TABLE notifications (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(120) NOT NULL,
    message     VARCHAR(255),
    type        notification_type NOT NULL DEFAULT 'system',
    request_id  INTEGER REFERENCES service_requests(id) ON DELETE SET NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ---------------------------------------------------------------------
-- 4. INDEXES  (foreign keys and common filters)
-- ---------------------------------------------------------------------
CREATE INDEX idx_technicians_company   ON technicians(company_id);
CREATE INDEX idx_technicians_category  ON technicians(category_id, availability);
CREATE INDEX idx_requests_customer     ON service_requests(customer_id, created_at DESC);
CREATE INDEX idx_requests_technician   ON service_requests(assigned_technician_id);
CREATE INDEX idx_requests_status       ON service_requests(status);
CREATE INDEX idx_offers_technician     ON request_offers(technician_id, status);
CREATE INDEX idx_jobs_technician       ON jobs(technician_id, status);
CREATE INDEX idx_job_parts_job         ON job_parts(job_id);
CREATE INDEX idx_job_photos_job        ON job_photos(job_id);
CREATE INDEX idx_invoices_status       ON invoices(status);
CREATE INDEX idx_reviews_technician    ON reviews(technician_id);
CREATE INDEX idx_notifications_user    ON notifications(user_id, is_read, created_at DESC);


-- ---------------------------------------------------------------------
-- 5. TRIGGERS  (keep updated_at current)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_requests_updated BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_jobs_updated     BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ---------------------------------------------------------------------
-- 6. VIEWS  (calculated values: never store these as columns)
-- ---------------------------------------------------------------------

-- Technician rating, review count and completed jobs
CREATE VIEW v_technician_stats AS
SELECT
    t.user_id AS technician_id,
    COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 1)
              FROM reviews r WHERE r.technician_id = t.user_id), 0) AS avg_rating,
    (SELECT COUNT(*) FROM reviews r WHERE r.technician_id = t.user_id) AS review_count,
    (SELECT COUNT(*) FROM jobs j
      WHERE j.technician_id = t.user_id AND j.status = 'closed')        AS jobs_completed
FROM technicians t;

-- Technician directory: used by "Choose Technician", Auto Select and owner list
CREATE VIEW v_technician_directory AS
SELECT
    t.user_id          AS technician_id,
    u.full_name,
    u.phone,
    u.is_active,
    c.id               AS company_id,
    c.name             AS company_name,
    sc.id              AS category_id,
    sc.name            AS category_name,
    t.service_rate,
    t.availability,
    s.avg_rating,
    s.review_count,
    s.jobs_completed
FROM technicians t
JOIN users u               ON u.id  = t.user_id
JOIN companies c           ON c.id  = t.company_id
JOIN service_categories sc ON sc.id = t.category_id
JOIN v_technician_stats s  ON s.technician_id = t.user_id;

-- Owner dashboard numbers and company rating
CREATE VIEW v_company_stats AS
SELECT
    c.id AS company_id,
    (SELECT COUNT(*) FROM technicians t WHERE t.company_id = c.id) AS total_technicians,
    (SELECT COUNT(*) FROM jobs j JOIN technicians t ON t.user_id = j.technician_id
      WHERE t.company_id = c.id AND j.status IN ('accepted', 'in_progress')) AS active_jobs,
    (SELECT COUNT(*) FROM jobs j JOIN technicians t ON t.user_id = j.technician_id
      WHERE t.company_id = c.id AND j.status = 'closed')                     AS completed_jobs,
    COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 1)
              FROM reviews r JOIN technicians t ON t.user_id = r.technician_id
              WHERE t.company_id = c.id), 0)                                  AS avg_rating,
    (SELECT COUNT(*) FROM reviews r JOIN technicians t ON t.user_id = r.technician_id
      WHERE t.company_id = c.id)                                              AS review_count
FROM companies c;


-- ---------------------------------------------------------------------
-- 7. SAMPLE DATA (optional, for development and demo)
--    Run on a fresh database: ids below rely on identity starting at 1.
--    Demo password for every account:  Test@1234
-- ---------------------------------------------------------------------
INSERT INTO service_categories (name) VALUES
    ('Plumbing'), ('Electrical'), ('AC Repair'), ('Carpentry'), ('Appliance'), ('Other');

INSERT INTO users (full_name, phone, email, password_hash, role, address) VALUES
    ('Daaem Butt',     '+923012345678', 'daaem@rayyanrepair.pk', crypt('Test@1234', gen_salt('bf')), 'owner',      NULL),                   -- id 1
    ('Bilal Sheikh',   '+923004445566', 'bilal@fixpro.pk',       crypt('Test@1234', gen_salt('bf')), 'owner',      NULL),                   -- id 2
    ('Hamza Malik',    '+923001112233', NULL,                    crypt('Test@1234', gen_salt('bf')), 'technician', NULL),                   -- id 3
    ('Ali Raza',       '+923001113344', NULL,                    crypt('Test@1234', gen_salt('bf')), 'technician', NULL),                   -- id 4
    ('Usman Tariq',    '+923001114455', NULL,                    crypt('Test@1234', gen_salt('bf')), 'technician', NULL),                   -- id 5
    ('Hamza Mirza',    '+923001115566', NULL,                    crypt('Test@1234', gen_salt('bf')), 'technician', NULL),                   -- id 6
    ('Raja Abubakar',  '+923001234567', 'raja@example.com',      crypt('Test@1234', gen_salt('bf')), 'customer',   'Apt 302, Block B, Satellite Town, Rawalpindi'); -- id 7

INSERT INTO companies (owner_id, name) VALUES
    (1, 'Rayyan Repair Services'),   -- id 1
    (2, 'FixPro Services');          -- id 2

INSERT INTO technicians (user_id, company_id, category_id, service_rate, availability) VALUES
    (3, 1, (SELECT id FROM service_categories WHERE name = 'Plumbing'),   1800, 'available'),
    (4, 1, (SELECT id FROM service_categories WHERE name = 'Electrical'), 1500, 'available'),
    (5, 1, (SELECT id FROM service_categories WHERE name = 'AC Repair'),  2200, 'unavailable'),
    (6, 2, (SELECT id FROM service_categories WHERE name = 'Plumbing'),   1500, 'available');

-- Request 1: full flow, closed and paid
-- Request 2: work in progress
-- Request 3: waiting for technician response
INSERT INTO service_requests
    (customer_id, category_id, title, description, address, access_time, urgency, booking_mode, assigned_technician_id, status)
VALUES
    (7, (SELECT id FROM service_categories WHERE name = 'Plumbing'),
     'Kitchen Sink Leakage', 'Water is leaking from the pipe under the kitchen sink.',
     'Apt 302, Block B, Satellite Town', '2026-11-22 14:30+05', 'medium', 'auto', 3, 'closed_paid'),
    (7, (SELECT id FROM service_categories WHERE name = 'Electrical'),
     'Ceiling Fan Repair', 'Ceiling fan is making noise and spinning slowly.',
     'Apt 302, Block B, Satellite Town', '2026-11-24 10:00+05', 'low', 'manual', 4, 'in_progress'),
    (7, (SELECT id FROM service_categories WHERE name = 'Plumbing'),
     'Washbasin Tap Leak', 'Tap keeps dripping after it is closed.',
     'Apt 302, Block B, Satellite Town', '2026-11-25 11:00+05', 'low', 'manual', NULL, 'waiting');

INSERT INTO ai_analyses (request_id, problem_title, summary, urgency, safety_note) VALUES
    (1, 'Kitchen sink leakage',
     'The leak seems to come from a loose or worn connector under the sink. It is usually safe to try a simple fix first.',
     'medium',
     'If water keeps leaking or the pipe is damaged, stop and book a technician.');

INSERT INTO ai_repair_steps (analysis_id, step_no, instruction) VALUES
    (1, 1, 'Turn off the water supply under the sink'),
    (1, 2, 'Place a bucket under the leak'),
    (1, 3, 'Tighten the connector by hand'),
    (1, 4, 'Turn the water on and check');

INSERT INTO request_offers (request_id, technician_id, quoted_price, status, decline_reason, responded_at) VALUES
    (1, 3, 1800, 'accepted', NULL, '2026-11-22 14:05+05'),
    (2, 4, 1500, 'accepted', NULL, now()),
    (3, 3, 1800, 'pending',  NULL, NULL);

INSERT INTO jobs
    (request_id, technician_id, status, accepted_at, started_at, expected_completion, completed_at, closed_at, labour_hours, labour_cost, work_notes)
VALUES
    (1, 3, 'closed',      '2026-11-22 14:05+05', '2026-11-22 14:30+05', '2026-11-22 15:30+05',
     '2026-11-22 15:40+05', '2026-11-22 16:10+05', 1.5, 1800,
     'Replaced the worn connector hose, sealed the joint and tested for leaks.'),
    (2, 4, 'in_progress', now(), now(), NULL, NULL, NULL, 0, 0, NULL);

INSERT INTO job_parts (job_id, part_name, quantity, unit_price) VALUES
    (1, 'Flexible connector hose', 1, 650),
    (1, 'Sealing tape',            1, 100);

INSERT INTO invoices (job_id, parts_total, labour_total, total_amount, status, sent_at) VALUES
    (1, 750, 1800, 2550, 'paid', '2026-11-22 15:45+05');

INSERT INTO payments (invoice_id, customer_id, amount, payment_method, paid_at) VALUES
    (1, 7, 2550, 'cash', '2026-11-22 16:10+05');

INSERT INTO reviews (job_id, customer_id, technician_id, rating, comment) VALUES
    (1, 7, 3, 5, 'Quick and tidy work. The leak is fixed.');

INSERT INTO notifications (user_id, title, message, type, request_id, is_read) VALUES
    (3, 'New request',       'Raja Abubakar - Washbasin Tap Leak',        'request',  3, FALSE),
    (3, 'Payment received',  'INV-2026-0001 - Rs 2,550',                  'payment',  1, FALSE),
    (3, 'New feedback',      'Raja Abubakar rated you 5 stars.',          'feedback', 1, TRUE),
    (7, 'Request accepted',  'Ali Raza accepted your request.',           'offer',    2, FALSE),
    (1, 'Invoice paid',      'INV-2026-0001 - Rs 2,550',                  'invoice',  1, FALSE);