# Smart Bookmark App

A modern bookmark manager built with **Next.js (App Router)**, **Supabase**, and **Tailwind CSS**. Features Google OAuth authentication, real-time updates across tabs, and private bookmarks per user.

## Live Demo
[https://smart-bookmark-app-lifp.vercel.app](https://smart-bookmark-app-lifp.vercel.app)

## Features
-  **Google OAuth Authentication** (no email/password)
-  **Add Bookmarks** with URL and title
-  **Private Bookmarks** – Users can only see their own bookmarks
-  **Real-time Updates** – Bookmarks appear instantly across open tabs
-  **Delete Bookmarks** with one click
-  **Responsive Design** with Tailwind CSS
-  **Deployed on Vercel**

##  Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Real-time**: Supabase Realtime subscriptions
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

---

##  Problems Faced & Solutions

### 1. Environment Variables Not Loading During Vercel Build
**Problem**: During deployment on Vercel, the build failed with the error: `@supabase/ssr: Your project's URL and API key are required to create a Supabase client!` The environment variables weren't being recognized during static page generation.

**Solution**: Added the environment variables in Vercel Dashboard under Project Settings → Environment Variables, marked them for Production, and redeployed with `--force` flag to clear build cache.

### 2. Google OAuth Redirecting to Localhost After Deployment
**Problem**: After successful deployment, clicking "Sign in with Google" redirected to `http://localhost:3000` instead of the live Vercel URL.

**Solution**: Updated Supabase Authentication Settings with new redirect URLs (`https://smart-bookmark-app-lifp.vercel.app/api/auth/callback` and `https://smart-bookmark-app-lifp.vercel.app`) and added the same callback URL to Google Cloud Console authorized redirect URIs.

### 3. Real-time Updates Not Working Across Tabs
**Problem**: When a bookmark was added in one tab, it wouldn't appear in other open tabs.

**Solution**: Enabled real-time on the `bookmarks` table in Supabase (`ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;`) and fixed the subscription implementation with proper event handling for INSERT and DELETE operations.

### 4. Module Import Errors During Build
**Problem**: Build failed with errors like `Module not found: Can't resolve '@/app/lib/supabase'` because absolute imports weren't resolving correctly.

**Solution**: Changed all imports from absolute paths to relative paths (e.g., `'@/app/lib/supabase'` → `'../lib/supabase'` in components) and cleared Next.js cache.

### 5. Row Level Security (RLS) Policy Errors
**Problem**: Users could see all bookmarks regardless of ownership and operations were failing with 403 errors.

**Solution**: Created proper RLS policies in Supabase for SELECT, INSERT, and DELETE operations using `auth.uid() = user_id` to ensure users can only access their own bookmarks.

### 6. URL Validation and Error Handling
**Problem**: Users could enter invalid URLs and no feedback was given for failed operations.

**Solution**: Added client-side URL validation using the URL constructor and implemented toast notifications using `react-hot-toast` for success/error messages and loading states.

### 7. Google Fonts CDN Issue During Development
**Problem**: Local development showed errors fetching Inter font from Google Fonts.

**Solution**: Recognized this as a network/DNS issue, not application-breaking. Next.js automatically falls back to system fonts and the issue doesn't affect production.

---

##  Local Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Cloud Console account

