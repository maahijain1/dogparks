-- Add featured field to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Create index for featured listings
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured);

-- Update some existing listings to be featured (optional - you can run this to set some as featured)
-- UPDATE listings SET featured = TRUE WHERE review_rating >= 4.0 LIMIT 6;




