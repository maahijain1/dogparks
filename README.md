# Directory Management System

Note: This commit is to trigger a Vercel preview deployment for diagnosing a deploy issue.

A comprehensive Next.js backend system for managing business listings and articles with Supabase integration.

## Features

### 🏢 Listings Management
- **States Management**: Create and manage states for your directory
- **Cities Management**: Add cities under existing states with dropdown selection
- **Business Listings**: Import CSV files or add individual business listings
- **CSV Import**: Bulk import listings with automatic field mapping

### 📝 Article Management
- **Rich Text Editor**: WordPress-like editor with formatting options
- **Image Support**: Add images via URL
- **Link Support**: Insert and manage links
- **Publishing System**: Draft and publish articles
- **SEO-Friendly**: URL slugs for better SEO

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Rich Text Editor**: Tiptap
- **CSV Processing**: Papa Parse
- **Icons**: Lucide React

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `src/lib/sql-schema.sql` in your Supabase SQL editor
3. This will create the following tables:
   - `states` - For managing states
   - `cities` - For managing cities under states
   - `listings` - For business listings
   - `articles` - For article content

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## CSV Import Format

When importing business listings via CSV, ensure your file has the following columns:

- `Business` - Business name
- `Category` - Business category
- `Review Ra` - Review rating (decimal)
- `Number o` - Number of reviews (integer)
- `Address` - Business address
- `Website` - Business website URL
- `Phone` - Phone number
- `Email` - Email address

## API Endpoints

### States
- `GET /api/states` - Get all states
- `POST /api/states` - Create a new state
- `PUT /api/states/[id]` - Update a state
- `DELETE /api/states/[id]` - Delete a state

### Cities
- `GET /api/cities` - Get all cities (with optional state filter)
- `POST /api/cities` - Create a new city
- `PUT /api/cities/[id]` - Update a city
- `DELETE /api/cities/[id]` - Delete a city

### Listings
- `GET /api/listings` - Get all listings (with optional filters)
- `POST /api/listings` - Create a new listing
- `PUT /api/listings/[id]` - Update a listing
- `DELETE /api/listings/[id]` - Delete a listing
- `POST /api/listings/import` - Import listings from CSV

### Articles
- `GET /api/articles` - Get all articles
- `POST /api/articles` - Create a new article
- `GET /api/articles/[id]` - Get a specific article
- `PUT /api/articles/[id]` - Update an article
- `DELETE /api/articles/[id]` - Delete an article

## Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   ├── articles/           # Article management pages
│   ├── listings/           # Listing management pages
│   └── page.tsx            # Homepage
├── components/
│   └── ArticleEditor.tsx   # Rich text editor component
├── lib/
│   ├── supabase.ts         # Supabase client configuration
│   └── sql-schema.sql      # Database schema
└── types/
    └── database.ts         # TypeScript type definitions
```

## Usage

1. **Start with States**: Create states for your directory
2. **Add Cities**: Create cities under each state
3. **Import Listings**: Upload your CSV file with business listings
4. **Create Articles**: Use the rich text editor to create engaging content

## Development

The project uses TypeScript for type safety and includes comprehensive error handling. All database operations are handled through Supabase with proper error responses.

## License

This project is open source and available under the MIT License.