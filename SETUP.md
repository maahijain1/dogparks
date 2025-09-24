# Quick Setup Guide

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to Settings > API
3. Copy your Project URL and anon public key
4. For the service role key, copy the service_role secret key

## 2. Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 3. Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy the contents of `src/lib/sql-schema.sql`
3. Paste and run the SQL to create all necessary tables

## 4. Test the Setup

1. Run `npm run dev`
2. Go to http://localhost:3000
3. Click on "Listings" and try creating a state
4. If successful, your setup is complete!

## CSV Import Example

Create a CSV file with these headers for testing:

```csv
Business,Category,Review Ra,Number o,Address,Website,Phone,Email
"Test Business","Restaurant",4.5,25,"123 Main St","https://test.com","(555) 123-4567","test@example.com"
```

## Troubleshooting

- **Database connection issues**: Check your Supabase URL and keys
- **CSV import fails**: Ensure your CSV has the correct column headers
- **Rich text editor not working**: Check browser console for JavaScript errors

## Next Steps

After setup, you can:
1. Create states and cities for your directory
2. Import your business listings via CSV
3. Create articles with the rich text editor
4. Customize the styling and add more features




