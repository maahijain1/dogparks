-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR DIRECTORY WEBSITE
-- =====================================================
-- This file contains all the SQL code needed to create
-- a complete directory website database from scratch.
-- 
-- Created: 2024
-- Purpose: Recreate the entire database structure
-- =====================================================

-- =====================================================
-- 1. SITE SETTINGS TABLE
-- =====================================================
-- Stores dynamic site configuration (site name, niche, country)
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial settings data
INSERT INTO site_settings (setting_key, setting_value) VALUES
('site_name', 'DirectoryHub'),
('niche', 'Dog Park'),
('country', 'USA');

-- Create an index on setting_key for faster lookups
CREATE INDEX idx_site_settings_key ON site_settings(setting_key);

-- =====================================================
-- 2. STATES TABLE
-- =====================================================
-- Stores state/province information
CREATE TABLE states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample states
INSERT INTO states (name) VALUES
('Alabama'),
('Arizona'),
('California'),
('Florida'),
('Texas'),
('New York'),
('South Dakota');

-- =====================================================
-- 3. CITIES TABLE
-- =====================================================
-- Stores city information linked to states
CREATE TABLE cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state_id UUID REFERENCES states(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, state_id)
);

-- Insert some sample cities
INSERT INTO cities (name, state_id) 
SELECT 'Phoenix', id FROM states WHERE name = 'Arizona'
UNION ALL
SELECT 'Tucson', id FROM states WHERE name = 'Arizona'
UNION ALL
SELECT 'Los Angeles', id FROM states WHERE name = 'California'
UNION ALL
SELECT 'San Francisco', id FROM states WHERE name = 'California'
UNION ALL
SELECT 'Miami', id FROM states WHERE name = 'Florida'
UNION ALL
SELECT 'Orlando', id FROM states WHERE name = 'Florida'
UNION ALL
SELECT 'Houston', id FROM states WHERE name = 'Texas'
UNION ALL
SELECT 'Dallas', id FROM states WHERE name = 'Texas'
UNION ALL
SELECT 'New York City', id FROM states WHERE name = 'New York'
UNION ALL
SELECT 'Buffalo', id FROM states WHERE name = 'New York'
UNION ALL
SELECT 'Sioux Falls', id FROM states WHERE name = 'South Dakota'
UNION ALL
SELECT 'Rapid City', id FROM states WHERE name = 'South Dakota'
UNION ALL
SELECT 'Birmingham', id FROM states WHERE name = 'Alabama'
UNION ALL
SELECT 'Montgomery', id FROM states WHERE name = 'Alabama';

-- =====================================================
-- 4. LISTINGS TABLE
-- =====================================================
-- Stores business listings information
CREATE TABLE listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(500),
  review_rating DECIMAL(3,2) DEFAULT 0,
  number_of_reviews INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample listings
INSERT INTO listings (business, category, address, phone, website, review_rating, number_of_reviews, featured, city_id)
SELECT 
  'Central Dog Park',
  'Dog Park',
  '123 Main St, Phoenix, AZ 85001',
  '(602) 555-0123',
  'https://centraldogpark.com',
  4.5,
  127,
  true,
  c.id
FROM cities c 
WHERE c.name = 'Phoenix' AND c.state_id = (SELECT id FROM states WHERE name = 'Arizona')

UNION ALL

SELECT 
  'Desert Paws Park',
  'Dog Park',
  '456 Oak Ave, Phoenix, AZ 85002',
  '(602) 555-0456',
  'https://desertpaws.com',
  4.2,
  89,
  false,
  c.id
FROM cities c 
WHERE c.name = 'Phoenix' AND c.state_id = (SELECT id FROM states WHERE name = 'Arizona')

UNION ALL

SELECT 
  'Golden Gate Dog Park',
  'Dog Park',
  '789 Beach St, San Francisco, CA 94102',
  '(415) 555-0789',
  'https://goldengatedogs.com',
  4.8,
  203,
  true,
  c.id
FROM cities c 
WHERE c.name = 'San Francisco' AND c.state_id = (SELECT id FROM states WHERE name = 'California')

UNION ALL

SELECT 
  'Miami Beach Dog Park',
  'Dog Park',
  '321 Ocean Dr, Miami, FL 33139',
  '(305) 555-0321',
  'https://miamibeachdogs.com',
  4.3,
  156,
  false,
  c.id
FROM cities c 
WHERE c.name = 'Miami' AND c.state_id = (SELECT id FROM states WHERE name = 'Florida');

-- =====================================================
-- 5. ARTICLES TABLE
-- =====================================================
-- Stores blog articles and content
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  content TEXT,
  featured_image VARCHAR(1000),
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample articles
INSERT INTO articles (title, slug, content, featured_image, published) VALUES
(
  'Our Favorite Management Tips on Motivating Your Team',
  'our-favorite-management-tips-on-motivating-your-team',
  '<p>Each weekday, in our Management Tip of the Day newsletter, HBR offers tips to help you better manage your team—and yourself. Here is a curated selection of our favorite Management Tips on motivating your team.</p><p>Subscribe to our Daily Newsletter</p><p>Management Tip of the Day</p><p>Quick, practical management advice to help you do your job better.</p><h2>How to Relaunch a Team That''s Lost Its Spark</h2><p>Team dynamics are rarely stable. A new hire, a departure, a strategy shift—each change reshapes how your team functions. Yet most leaders push forward without resetting, which can lead to misalignment and burnout. If your team''s energy is off, it may be time for a full relaunch. Here''s how.</p>',
  'https://hbr.org/resources/images/article_assets/2025/09/Sep25_23_200389697-001.jpg',
  true
),

(
  'How Do Weight Loss Medications Affect Our Relationship With Food',
  'how-do-weight-loss-medications-affect-our-relationship-with-food',
  '<p>Weight loss medications have become increasingly popular in recent years, but how do they affect our relationship with food? This comprehensive guide explores the psychological and physiological impacts.</p><h2>Understanding Weight Loss Medications</h2><p>Weight loss medications work in various ways to help individuals achieve their health goals. However, it''s important to understand both the benefits and potential side effects.</p>',
  'https://example.com/weight-loss-article.jpg',
  true
),

(
  'How a Man''s Affair With His Mother-in-Law Became a Viral Film in Indonesia',
  'how-a-mans-affair-with-his-mother-in-law-became-a-viral-film-in-indonesia',
  '<p>This fascinating story explores how a personal family drama became a viral sensation and eventually a film in Indonesia. The story touches on family dynamics, social media, and cultural perceptions.</p><h2>The Story Behind the Film</h2><p>What started as a private family matter quickly became public knowledge through social media, leading to widespread discussion and eventually a film adaptation.</p>',
  'https://example.com/indonesia-film.jpg',
  true
);

-- =====================================================
-- 6. ADMIN USERS TABLE (Optional)
-- =====================================================
-- Stores admin user credentials for the admin panel
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
-- Note: In production, use a proper password hashing function
INSERT INTO admin_users (username, password_hash, email) VALUES
('admin', '$2b$10$rQZ8vQZ8vQZ8vQZ8vQZ8vO', 'admin@directoryhub.com');

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Cities indexes
CREATE INDEX idx_cities_state_id ON cities(state_id);
CREATE INDEX idx_cities_name ON cities(name);

-- Listings indexes
CREATE INDEX idx_listings_city_id ON listings(city_id);
CREATE INDEX idx_listings_featured ON listings(featured);
CREATE INDEX idx_listings_business ON listings(business);
CREATE INDEX idx_listings_category ON listings(category);

-- Articles indexes
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(published);
CREATE INDEX idx_articles_created_at ON articles(created_at);

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for all tables with updated_at column
CREATE TRIGGER update_site_settings_updated_at 
    BEFORE UPDATE ON site_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_states_updated_at 
    BEFORE UPDATE ON states 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cities_updated_at 
    BEFORE UPDATE ON cities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at 
    BEFORE UPDATE ON listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow public read access to most tables
CREATE POLICY "Allow public read access" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON states FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON cities FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON listings FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON articles FOR SELECT USING (true);

-- Admin users should only be accessible by authenticated users
CREATE POLICY "Allow authenticated read access" ON admin_users FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- 10. SAMPLE DATA QUERIES FOR TESTING
-- =====================================================

-- Query to get all listings with city and state information
/*
SELECT 
  l.business,
  l.category,
  l.address,
  l.phone,
  l.website,
  l.review_rating,
  l.featured,
  c.name as city_name,
  s.name as state_name
FROM listings l
JOIN cities c ON l.city_id = c.id
JOIN states s ON c.state_id = s.id
ORDER BY l.featured DESC, l.review_rating DESC;
*/

-- Query to get featured listings by city
/*
SELECT 
  l.business,
  l.category,
  l.address,
  l.phone,
  l.website,
  l.review_rating,
  c.name as city_name,
  s.name as state_name
FROM listings l
JOIN cities c ON l.city_id = c.id
JOIN states s ON c.state_id = s.id
WHERE l.featured = true
ORDER BY l.review_rating DESC;
*/

-- Query to get all cities in a specific state
/*
SELECT 
  c.name as city_name,
  COUNT(l.id) as listing_count
FROM cities c
LEFT JOIN listings l ON c.id = l.city_id
JOIN states s ON c.state_id = s.id
WHERE s.name = 'Arizona'
GROUP BY c.id, c.name
ORDER BY listing_count DESC;
*/

-- =====================================================
-- END OF DATABASE SCHEMA
-- =====================================================
-- 
-- This schema includes:
-- ✅ Site settings for dynamic configuration
-- ✅ States and cities with proper relationships
-- ✅ Business listings with all necessary fields
-- ✅ Articles/blog system
-- ✅ Admin user management
-- ✅ Proper indexes for performance
-- ✅ Automatic timestamp updates
-- ✅ Row Level Security policies
-- ✅ Sample data for testing
-- 
-- To use this schema:
-- 1. Run this entire SQL file in your Supabase SQL Editor
-- 2. Update the site_settings table with your specific values
-- 3. Add your own states, cities, and listings
-- 4. Configure your environment variables
-- 5. Deploy your Next.js application
-- 
-- =====================================================

