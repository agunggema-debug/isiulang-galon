# Deployment Guide - Netlify + Supabase

## Overview
This application supports both local development (SQLite) and production deployment (Supabase).

## Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```
   
   The application will use SQLite database automatically (no Supabase config needed).

3. **Default login credentials**
   - Admin: `admin@aquagas.com` / `admin123`
   - Wholesale: `grosir@aquagas.com` / `grosir123`
   - Retail: `retail@aquagas.com` / `retail123`

## Production Deployment (Netlify + Supabase)

### Step 1: Setup Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration script:
   - File: `supabase/migrations/01_initial_schema.sql`
3. Go to Authentication > Settings and configure:
   - Enable Email signups
   - Configure email provider

### Step 2: Configure Netlify Environment Variables

In Netlify Dashboard > Site Settings > Build & Deploy > Environment:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

### Step 3: Deploy to Netlify

1. Connect your Git repository to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Click "Deploy site"

### Step 4: Create Admin User via Supabase Auth

After deployment, create admin user through Supabase Auth dashboard.
The user metadata should include `role: "admin"` in `user_metadata`.

## Important Notes

### Session Timeout
- Admin sessions: 2 hours (idle timeout)
- User sessions: 7 days (idle timeout)

### RLS (Row Level Security) Policies
The SQL migration includes RLS policies. Review them in Supabase dashboard under Table Editor > Policies.

### Environment Variables (.env.local)
For local development, keep `.env.local` without Supabase variables to use SQLite mode.
For testing Supabase locally, add the Supabase variables to `.env.local`.

## File Structure

```
src/
├── app/
│   ├── api/          # API routes (works with both SQLite & Supabase)
│   ├── admin/        # Admin dashboard pages
│   ├── shop/         # Shop pages
│   └── page.tsx      # Homepage
├── lib/
│   ├── database.ts   # Database layer (SQLite for dev, Supabase for prod)
│   ├── auth.ts       # Auth layer (custom for dev, Supabase Auth for prod)
│   ├── supabase.ts   # Supabase client configuration
│   └── types.ts      # TypeScript types
└── middleware.ts     # Next.js middleware for auth & rate limiting

supabase/
└── migrations/
    └── 01_initial_schema.sql  # Supabase database schema