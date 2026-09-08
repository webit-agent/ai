CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  telegram_chat_id VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  website_url VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracked_products (
  id UUID PRIMARY KEY,
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  is_active BOOL DEFAULT true,
  last_checked_at TIMESTAMP,
  last_status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY,
  tracked_product_id UUID REFERENCES tracked_products(id) ON DELETE CASCADE,
  price DECIMAL(12,2),
  currency VARCHAR(10),
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  raw_html_snapshot TEXT
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tracked_product_id UUID REFERENCES tracked_products(id) ON DELETE CASCADE,
  alert_type VARCHAR NOT NULL,
  old_value VARCHAR,
  new_value VARCHAR,
  sent_at TIMESTAMP,
  read_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_alerts BOOL DEFAULT true,
  telegram_alerts BOOL DEFAULT false,
  alert_threshold_percent DECIMAL(5,2) DEFAULT 0
);

-- Telegram linking columns (add if upgrading existing DB)
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_link_token VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_link_token_expires TIMESTAMP;

-- Content monitoring table (Phase 3)
CREATE TABLE IF NOT EXISTS content_snapshots (
  id UUID PRIMARY KEY,
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  screenshot_path VARCHAR,
  page_hash VARCHAR,
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  change_detected BOOLEAN DEFAULT false
);

ALTER TABLE alerts ADD COLUMN IF NOT EXISTS screenshot_path VARCHAR;
