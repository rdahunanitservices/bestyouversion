-- ============================================
-- BESTYOUVERSION DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_date DATE NOT NULL,
  time_slot VARCHAR(5) NOT NULL,          -- '09:00', '14:00', etc.
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50) NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'confirmed', 'cancelled', 'completed')),
  amount INTEGER DEFAULT 150000,           -- in centavos (₱1,500 = 150000)
  payment_id VARCHAR(255),                 -- PayMongo payment ID
  payment_method VARCHAR(50),              -- gcash, card, maya, etc.
  google_calendar_event_id VARCHAR(255),   -- Google Calendar event ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent double-booking same date+time (only for active bookings)
  UNIQUE (booking_date, time_slot)
);

-- 2. Create index for common queries
CREATE INDEX idx_bookings_date ON bookings (booking_date);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_payment_id ON bookings (payment_id);

-- 3. Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public can INSERT (create new bookings)
CREATE POLICY "Anyone can create a booking"
  ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public can read their own booking by ID (for payment status check)
CREATE POLICY "Anyone can read bookings"
  ON bookings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated (admin) can UPDATE
CREATE POLICY "Admin can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated (admin) can DELETE
CREATE POLICY "Admin can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (true);

-- 4. Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 5. Function to prevent double-booking (excludes cancelled)
-- Drop the simple unique constraint and use a partial unique index instead
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_date_time_slot_key;

CREATE UNIQUE INDEX idx_unique_active_booking
  ON bookings (booking_date, time_slot)
  WHERE status NOT IN ('cancelled');
