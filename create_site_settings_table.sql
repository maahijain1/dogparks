-- Create the site_settings table
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

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at when a row is modified
CREATE TRIGGER update_site_settings_updated_at 
    BEFORE UPDATE ON site_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
