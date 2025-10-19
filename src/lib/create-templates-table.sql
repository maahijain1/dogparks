-- Create article_templates table for template management
CREATE TABLE IF NOT EXISTS article_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_article_templates_slug ON article_templates(slug);
CREATE INDEX IF NOT EXISTS idx_article_templates_active ON article_templates(is_active);

-- Add template_id and city_id columns to articles table if they don't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES article_templates(id);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_articles_template_id ON articles(template_id);
CREATE INDEX IF NOT EXISTS idx_articles_city_id ON articles(city_id);

-- Add RLS policies for article_templates
ALTER TABLE article_templates ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read templates
CREATE POLICY "Allow authenticated users to read templates" ON article_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert templates
CREATE POLICY "Allow authenticated users to insert templates" ON article_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update templates
CREATE POLICY "Allow authenticated users to update templates" ON article_templates
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete templates
CREATE POLICY "Allow authenticated users to delete templates" ON article_templates
  FOR DELETE USING (auth.role() = 'authenticated');
