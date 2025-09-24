# How to Set Up Featured Listings

## Step 1: Add the Featured Field to Your Database

Run this SQL command in your Supabase SQL Editor:

```sql
-- Add featured field to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured);
```

## Step 2: Mark Listings as Featured (Super Easy!)

1. Go to `/admin/listings/businesses`
2. Find any listing you want to feature
3. Click the **"Make Featured"** button next to it
4. The button will change to **"Featured"** (yellow background)
5. That's it! The listing now appears in the Featured Listings section!

## Step 3: How It Works

- **Featured Listings Section**: Shows only listings where `featured = true`
- **All Listings Section**: Shows all listings (featured and non-featured)
- **One-Click Control**: Simple button to add/remove from featured status
- **API**: Use `/api/listings?featured=true` to get only featured listings

## Step 4: Control Featured Listings

- **Add to Featured**: Click "Make Featured" button
- **Remove from Featured**: Click "Featured" button (it will toggle back)
- **Visual Indicator**: 
  - Gray "Make Featured" button = Not featured
  - Yellow "Featured" button = Currently featured

## Benefits

✅ **One-Click Control**: Super simple button interface
✅ **Instant Updates**: Changes reflect immediately on homepage
✅ **Visual Feedback**: Clear button states show featured status
✅ **No Forms**: No need to edit listings, just click the button!

Your featured listings will now appear in the "Featured Listings" section on your homepage!
