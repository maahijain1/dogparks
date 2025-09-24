# Directory Management System - Database Schema

## Overview
This document contains all the SQL code used to set up the database schema for the Directory Management System. This schema supports states, cities, business listings, and articles management.

## Database Tables

### 1. States Table
```sql
CREATE TABLE IF NOT EXISTS states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Cities Table
```sql
CREATE TABLE IF NOT EXISTS cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, state_id)
);
```

### 3. Listings Table
```sql
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  review_rating DECIMAL(3,1) NOT NULL,
  number_of_reviews INTEGER NOT NULL,
  address TEXT NOT NULL,
  website TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Articles Table
```sql
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  featured_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Performance Indexes

### Cities Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_cities_state_id ON cities(state_id);
```

### Listings Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_listings_city_id ON listings(city_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
```

### Articles Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
```

## Automatic Timestamp Updates

### Trigger Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

### Triggers for Each Table
```sql
-- States trigger
CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cities trigger
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Listings trigger
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Articles trigger
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Complete Setup Script

Here's the complete SQL script to set up the entire database:

```sql
-- Create states table
CREATE TABLE IF NOT EXISTS states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, state_id)
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  review_rating DECIMAL(3,1) NOT NULL,
  number_of_reviews INTEGER NOT NULL,
  address TEXT NOT NULL,
  website TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  featured_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cities_state_id ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_listings_city_id ON listings(city_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Table Relationships

```
states (1) -----> (many) cities (1) -----> (many) listings
articles (independent table)
```

### Relationship Details:
- **States → Cities**: One-to-Many (One state can have many cities)
- **Cities → Listings**: One-to-Many (One city can have many business listings)
- **Articles**: Independent table for content management

## CSV Import Format

When importing business listings via CSV, ensure your file has the following columns:

| Column Name | Description | Example |
|-------------|-------------|---------|
| Business | Business name | "Club-K9" |
| Category | Business category | "Dog park" |
| Review Ra | Review rating (decimal) | "4.7" |
| Number o | Number of reviews (integer) | "43" |
| Address | Business address | "19350 Winmeade Dr, Leesburg, VA 20176" |
| Website | Business website URL | "https://example.com" |
| Phone | Phone number | "(571) 926-9000" |
| Email | Email address | "contact@example.com" |

## Setup Instructions

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Navigate to SQL Editor**
4. **Click "New Query"**
5. **Copy and paste the complete setup script above**
6. **Click "Run" to execute**

## Notes

- All tables use UUID primary keys for better scalability
- Foreign key constraints ensure data integrity
- Automatic timestamps track creation and update times
- Indexes are created for optimal query performance
- Cascade deletes maintain referential integrity
- The schema supports the full Directory Management System functionality

---

**Generated for Directory Management System**  
*Version: 1.0*  
*Date: $(date)*




