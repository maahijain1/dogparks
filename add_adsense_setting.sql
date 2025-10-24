-- Add AdSense ID setting to site_settings table
INSERT INTO site_settings (setting_key, setting_value) VALUES
('adsense_id', '')
ON CONFLICT (setting_key) DO NOTHING;

-- Update the setting if it already exists
UPDATE site_settings 
SET setting_value = '' 
WHERE setting_key = 'adsense_id' AND setting_value IS NULL;
