-- Add comprehensive kennel-specific fields to listings table
-- This migration adds fields for advanced filtering of dog boarding kennels

-- Add new columns to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS boarding_type VARCHAR(50), -- cage-based, suite, free-roam, in-home
ADD COLUMN IF NOT EXISTS dog_size_accepted VARCHAR(100), -- small, medium, large, all-sizes
ADD COLUMN IF NOT EXISTS breed_restrictions TEXT, -- text description of breed restrictions
ADD COLUMN IF NOT EXISTS services_offered TEXT[], -- array of services: playtime, walks, grooming, training, medical
ADD COLUMN IF NOT EXISTS supervision_24_7 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cctv_access BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vet_on_call BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vaccination_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS price_per_night DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_per_week DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_per_month DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS max_dogs INTEGER,
ADD COLUMN IF NOT EXISTS outdoor_space BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS indoor_space BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS pickup_dropoff_times TEXT,
ADD COLUMN IF NOT EXISTS special_diet_accommodation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS medication_administered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS exercise_schedule TEXT,
ADD COLUMN IF NOT EXISTS social_playtime BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS individual_attention BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS webcam_access BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS insurance_coverage BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS licensing_info TEXT,
ADD COLUMN IF NOT EXISTS years_in_business INTEGER,
ADD COLUMN IF NOT EXISTS staff_ratio VARCHAR(20), -- e.g., "1:5" (1 staff per 5 dogs)
ADD COLUMN IF NOT EXISTS temperature_controlled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS noise_level VARCHAR(20), -- quiet, moderate, active
ADD COLUMN IF NOT EXISTS special_needs_accommodation BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance on new filter fields
CREATE INDEX IF NOT EXISTS idx_listings_boarding_type ON listings(boarding_type);
CREATE INDEX IF NOT EXISTS idx_listings_dog_size ON listings(dog_size_accepted);
CREATE INDEX IF NOT EXISTS idx_listings_supervision_24_7 ON listings(supervision_24_7);
CREATE INDEX IF NOT EXISTS idx_listings_cctv ON listings(cctv_access);
CREATE INDEX IF NOT EXISTS idx_listings_vet_on_call ON listings(vet_on_call);
CREATE INDEX IF NOT EXISTS idx_listings_vaccination ON listings(vaccination_required);
CREATE INDEX IF NOT EXISTS idx_listings_price_night ON listings(price_per_night);
CREATE INDEX IF NOT EXISTS idx_listings_latitude ON listings(latitude);
CREATE INDEX IF NOT EXISTS idx_listings_longitude ON listings(longitude);
CREATE INDEX IF NOT EXISTS idx_listings_max_dogs ON listings(max_dogs);
CREATE INDEX IF NOT EXISTS idx_listings_outdoor_space ON listings(outdoor_space);
CREATE INDEX IF NOT EXISTS idx_listings_indoor_space ON listings(indoor_space);
CREATE INDEX IF NOT EXISTS idx_listings_emergency_contact ON listings(emergency_contact);
CREATE INDEX IF NOT EXISTS idx_listings_special_diet ON listings(special_diet_accommodation);
CREATE INDEX IF NOT EXISTS idx_listings_medication ON listings(medication_administered);
CREATE INDEX IF NOT EXISTS idx_listings_social_playtime ON listings(social_playtime);
CREATE INDEX IF NOT EXISTS idx_listings_individual_attention ON listings(individual_attention);
CREATE INDEX IF NOT EXISTS idx_listings_webcam ON listings(webcam_access);
CREATE INDEX IF NOT EXISTS idx_listings_insurance ON listings(insurance_coverage);
CREATE INDEX IF NOT EXISTS idx_listings_years_business ON listings(years_in_business);
CREATE INDEX IF NOT EXISTS idx_listings_temperature ON listings(temperature_controlled);
CREATE INDEX IF NOT EXISTS idx_listings_noise_level ON listings(noise_level);
CREATE INDEX IF NOT EXISTS idx_listings_special_needs ON listings(special_needs_accommodation);

-- Create a GIN index for the services_offered array for efficient array queries
CREATE INDEX IF NOT EXISTS idx_listings_services_gin ON listings USING GIN(services_offered);

-- Add comments to document the new fields
COMMENT ON COLUMN listings.boarding_type IS 'Type of boarding: cage-based, suite, free-roam, in-home';
COMMENT ON COLUMN listings.dog_size_accepted IS 'Dog sizes accepted: small, medium, large, all-sizes';
COMMENT ON COLUMN listings.breed_restrictions IS 'Text description of any breed restrictions';
COMMENT ON COLUMN listings.services_offered IS 'Array of services offered: playtime, walks, grooming, training, medical';
COMMENT ON COLUMN listings.supervision_24_7 IS 'Whether staff is on-site 24/7';
COMMENT ON COLUMN listings.cctv_access IS 'Whether CCTV access is provided to owners';
COMMENT ON COLUMN listings.vet_on_call IS 'Whether a vet is on call';
COMMENT ON COLUMN listings.vaccination_required IS 'Whether vaccinations are required';
COMMENT ON COLUMN listings.price_per_night IS 'Price per night in USD';
COMMENT ON COLUMN listings.price_per_week IS 'Price per week in USD';
COMMENT ON COLUMN listings.price_per_month IS 'Price per month in USD';
COMMENT ON COLUMN listings.latitude IS 'Latitude for distance calculations';
COMMENT ON COLUMN listings.longitude IS 'Longitude for distance calculations';
COMMENT ON COLUMN listings.max_dogs IS 'Maximum number of dogs they can accommodate';
COMMENT ON COLUMN listings.outdoor_space IS 'Whether outdoor space is available';
COMMENT ON COLUMN listings.indoor_space IS 'Whether indoor space is available';
COMMENT ON COLUMN listings.emergency_contact IS 'Emergency contact phone number';
COMMENT ON COLUMN listings.pickup_dropoff_times IS 'Available pickup and dropoff times';
COMMENT ON COLUMN listings.special_diet_accommodation IS 'Whether they accommodate special diets';
COMMENT ON COLUMN listings.medication_administered IS 'Whether they can administer medication';
COMMENT ON COLUMN listings.exercise_schedule IS 'Description of exercise schedule';
COMMENT ON COLUMN listings.social_playtime IS 'Whether social playtime is provided';
COMMENT ON COLUMN listings.individual_attention IS 'Whether individual attention is provided';
COMMENT ON COLUMN listings.webcam_access IS 'Whether webcam access is provided';
COMMENT ON COLUMN listings.insurance_coverage IS 'Whether they have insurance coverage';
COMMENT ON COLUMN listings.licensing_info IS 'Licensing and certification information';
COMMENT ON COLUMN listings.years_in_business IS 'Number of years in business';
COMMENT ON COLUMN listings.staff_ratio IS 'Staff to dog ratio (e.g., 1:5)';
COMMENT ON COLUMN listings.temperature_controlled IS 'Whether temperature is controlled';
COMMENT ON COLUMN listings.noise_level IS 'Noise level: quiet, moderate, active';
COMMENT ON COLUMN listings.special_needs_accommodation IS 'Whether they accommodate special needs dogs';
