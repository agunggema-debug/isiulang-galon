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

**CRITICAL: Make sure to set these environment variables in Netlify Dashboard**

In Netlify Dashboard > Site Settings > Build & Deploy > Environment > Environment variables:

| Variable Name | Value | Required |
|--------------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g., `https://xyz.supabase.co`) | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | ✅ Yes |
| `NEXTAUTH_SECRET` | Random secret string for sessions | ❌ Optional |

### Step 3: Deploy to Netlify

1. Connect your Git repository to Netlify
2. Build settings (auto-detected from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Click "Deploy site"

### Step 4: Create Admin User via Supabase Auth

After deployment:
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" and create admin user
3. In user metadata, add: `{"role": "admin"}`

## Troubleshooting

### 502 Bad Gateway Errors on API Routes

This error occurs when Supabase environment variables are **NOT** configured. Common issues:

1. **Missing Environment Variables**: Check Netlify > Site Settings > Build & Deploy > Environment variables
2. **Incorrect Variable Names**: Make sure variable names match exactly (case-sensitive)
3. **Plugin Not Installed**: The `@netlify/plugin-nextjs` plugin is required

**Verify your configuration by checking browser console - you should see error messages like "Supabase belum dikonfigurasi" if variables are missing.**

### Common Environment Variable Issues

| Error | Cause | Solution |
|-------|-------|----------|
| 502 on /api/auth/login | Missing `NEXT_PUBLIC_SUPABASE_URL` | Add the variable in Netlify env |
| 502 on /api/products | Missing Supabase config | Add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Login fails after deployment | Wrong keys or missing user in database | Check Supabase keys and create user in Auth + Database |

## Important Notes

### Session Timeout
- Admin sessions: 2 hours (idle timeout)
- User sessions: 7 days (idle timeout)

### RLS (Row Level Security) Policies
The SQL migration includes RLS policies. Review them in Supabase dashboard under Table Editor > Policies.

### Environment Variables (.env.local)
For local development, keep `.env.local` without Supabase variables to use SQLite mode (recommended).
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