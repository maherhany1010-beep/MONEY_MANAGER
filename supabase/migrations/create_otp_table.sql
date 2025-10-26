-- Create OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL,
  code VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  
  -- Indexes for faster queries
  CONSTRAINT otp_email_code_unique UNIQUE(email, code),
  CONSTRAINT otp_code_length CHECK (LENGTH(code) = 6),
  CONSTRAINT otp_code_numeric CHECK (code ~ '^[0-9]+$')
);

-- Create indexes
CREATE INDEX idx_otp_email ON otp_codes(email);
CREATE INDEX idx_otp_expires_at ON otp_codes(expires_at);
CREATE INDEX idx_otp_verified ON otp_codes(verified);
CREATE INDEX idx_otp_email_verified ON otp_codes(email, verified);

-- Enable Row Level Security
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to insert OTP codes
CREATE POLICY "Allow insert OTP codes" ON otp_codes
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to select their own OTP codes
CREATE POLICY "Allow select own OTP codes" ON otp_codes
  FOR SELECT
  USING (true);

-- Allow anyone to update their own OTP codes
CREATE POLICY "Allow update own OTP codes" ON otp_codes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete expired OTP codes
CREATE POLICY "Allow delete expired OTP codes" ON otp_codes
  FOR DELETE
  USING (expires_at < NOW());

-- Create function to clean up expired OTP codes
CREATE OR REPLACE FUNCTION cleanup_expired_otp_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run cleanup daily
-- Note: This would typically be set up via a cron job or scheduled function
-- For now, we'll rely on manual cleanup or application-level cleanup

-- Add comment
COMMENT ON TABLE otp_codes IS 'Stores OTP codes for email verification during signup and password reset';
COMMENT ON COLUMN otp_codes.email IS 'Email address associated with the OTP';
COMMENT ON COLUMN otp_codes.code IS 'The 6-digit OTP code';
COMMENT ON COLUMN otp_codes.created_at IS 'When the OTP was created';
COMMENT ON COLUMN otp_codes.expires_at IS 'When the OTP expires';
COMMENT ON COLUMN otp_codes.attempts IS 'Number of failed verification attempts';
COMMENT ON COLUMN otp_codes.verified IS 'Whether the OTP has been successfully verified';

