-- Create enum for impact type
CREATE TYPE impact_type AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Create email verification codes table
CREATE TABLE email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_codes_email_code ON email_verification_codes(email, code);
CREATE INDEX idx_email_codes_expires ON email_verification_codes("expiresAt");

-- Create moments table
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "shortDescription" TEXT,
  "richContent" TEXT NOT NULL,
  "textPreview" TEXT,
  "impactPercent" DOUBLE PRECISION NOT NULL,
  "impactType" impact_type NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_moments_user_created ON moments("userId", "createdAt");
CREATE INDEX idx_moments_user ON moments("userId");

-- Create moment images table
CREATE TABLE moment_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "momentId" UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  "imageUrl" TEXT NOT NULL,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_moment_images_moment ON moment_images("momentId");

-- Create storage bucket for moment images
INSERT INTO storage.buckets (id, name, public)
VALUES ('moments', 'moments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to moment images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'moments');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'moments' AND auth.role() = 'authenticated');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (bucket_id = 'moments' AND auth.role() = 'authenticated');

