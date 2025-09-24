# Quick Setup: Add Featured Column to Database

## Step 1: Add the Featured Column

Go to your **Supabase Dashboard** → **SQL Editor** and run this command:

```sql
ALTER TABLE listings ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
```

## Step 2: Create Index (Optional but Recommended)

```sql
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured);
```

## Step 3: Test the Button

1. Go to `/admin/listings/businesses`
2. Click "Make Featured" on any listing
3. The button should change from gray to yellow
4. Check the browser console (F12) for any error messages

## Troubleshooting

If the button still doesn't work:

1. **Check Console**: Press F12 → Console tab → Look for error messages
2. **Check Network**: Press F12 → Network tab → Click the button → Look for failed requests
3. **Verify Column**: In Supabase → Table Editor → listings table → Check if "featured" column exists

## Expected Behavior

- **Before**: Gray "Make Featured" button
- **After**: Yellow "Featured" button
- **Homepage**: Featured listings appear in the "Featured Listings" section

## Quick Test

After adding the column, you can also test by running this SQL to mark some listings as featured:

```sql
UPDATE listings SET featured = TRUE WHERE review_rating >= 4.0 LIMIT 3;
```

This will mark the top 3 highest-rated listings as featured automatically.






