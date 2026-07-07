# Deployment Guide - Vercel + Supabase

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

## Production Deployment (Vercel + Supabase)

### Step 1: Setup Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration scripts in order:
   - File: `supabase/migrations/01_initial_schema.sql`
   - File: `supabase/migrations/02_auth_trigger.sql` (or `02_auto_create_user.sql` if exists)
   - File: `supabase/migrations/03_fix_users_rls.sql` (if exists)
3. Go to Authentication > Settings and configure:
   - Enable Email signups
   - Configure email provider

### Step 2: Get Supabase Credentials

1. Login to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Project Settings** (gear icon) → **API**
4. Copy these values:
   - **Project URL** → for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → for `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Push Code to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and login
2. Click **"Add New"** → **"Project"**
3. Select your repository: `agunggema-debug/isiulang-galon`
4. In **"Configure Project"** page, add these **Environment Variables**:

   | Variable Name | Value | Required |
   |--------------|-------|----------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | ✅ Yes |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | ✅ Yes |

5. **Build & Output Settings**: Leave as default (Vercel auto-detects Next.js)
6. Click **"Deploy"**

### Step 5: Create Admin User via Supabase Auth

After deployment:
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" and create admin user
3. **In user metadata, add:**
   ```json
   {
     "role": "admin",
     "name": "Admin Name"
   }
   ```
   
   > **Note:** The system now automatically creates user profiles in the `users` table upon first login. Just set the `role` in user metadata.

## Custom Domain (Optional)

1. In Vercel Dashboard → Project → **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## Troubleshooting

### User tidak ditemukan di database (Error 404)

This error means the user exists in Supabase Auth but not in the `users` table. Solutions:

1. **Make sure user has metadata with role**: When creating user in Supabase Auth, add `{"role": "admin"}` in user metadata
2. **The latest code auto-creates user profile**: If user doesn't exist in `users` table after login, it will be created automatically
3. **If still failing, manually insert user**:
   ```sql
   INSERT INTO users (email, name, role, phone, address)
   VALUES ('admin@aquagas.com', 'Admin', 'admin', '', '');
   ```

### 401 Unauthorized after login

This happens when:
1. Service role key is missing - check `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment variables
2. RLS policies are blocking access - run the updated migration again

### 502 Bad Gateway Errors on API Routes

This error occurs when Supabase environment variables are **NOT** configured. Common issues:

1. **Missing Environment Variables**: Check Vercel Dashboard → Project → Settings → Environment Variables
2. **Incorrect Variable Names**: Make sure variable names match exactly (case-sensitive)

**Verify your configuration by checking browser console - you should see error messages like "Supabase belum dikonfigurasi" if variables are missing.**

### Common Environment Variable Issues

| Error | Cause | Solution |
|-------|-------|----------|
| 502 on `/api/auth/login` | Missing `NEXT_PUBLIC_SUPABASE_URL` | Add the variable in Vercel env |
| 502 on `/api/products` | Missing Supabase config | Add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
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
    ├── 01_initial_schema.sql  # Supabase database schema
    ├── 02_auth_trigger.sql    # Auth trigger
    └── 03_fix_users_rls.sql   # RLS policy fixes