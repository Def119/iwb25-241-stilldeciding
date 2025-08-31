# 🔧 Supabase Setup Guide for Whispr

## What You Need from Supabase

### Required Services:
- ✅ **Authentication** (Email/Password)
- ✅ **Database** (PostgreSQL)
- ✅ **Real-time** (for live chat updates)

### Required API Keys:
- ✅ **Project URL** (e.g., `https://your-project.supabase.co`)
- ✅ **Anon Key** (Public key for client-side operations)

## Step-by-Step Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `whispr-chat` (or any name you prefer)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Wait for project to be ready (2-3 minutes)

### 2. Get Your API Keys
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configure Authentication
1. Go to **Authentication** → **Settings**
2. **Enable email confirmations**: 
   - For development: ❌ Disable (faster testing)
   - For production: ✅ Enable (more secure)
3. **Site URL**: `http://localhost:8081` (for development)
4. **Redirect URLs**: Add your app's deep link URLs if needed

### 4. Set Up Database Tables (Optional for Basic Auth)
For the basic version, Supabase automatically creates user tables. For advanced features, you might want:

```sql
-- Users table (auto-created by Supabase Auth)
-- No action needed

-- Optional: Extended user profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  public_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Optional: Policy to allow users to see only their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 5. Configure Your App
1. Copy your credentials
2. Run the setup script:
   ```bash
   npm run setup
   ```
3. Or manually create `.env` file:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## What Each Key Does

### 🔗 Project URL
- **Purpose**: Tells your app where to connect
- **Security**: ✅ Safe to expose publicly
- **Example**: `https://abcdefgh.supabase.co`

### 🔑 Anon Key
- **Purpose**: Allows public access to your database with RLS rules
- **Security**: ✅ Safe to expose publicly (protected by RLS)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 🚫 Service Role Key (NOT NEEDED for client apps)
- **Purpose**: Full database access (bypass RLS)
- **Security**: ❌ NEVER expose this in client apps
- **Use**: Only for backend/server operations

## Quick Start Commands

```bash
# 1. Set up Supabase credentials
npm run setup

# 2. Start the app
npm start

# 3. Test registration
# Open the app and create an account
```

## Troubleshooting

### ❌ "Invalid API key"
- Check your `.env` file has correct values
- Ensure no extra spaces in the keys
- Verify the project URL ends with `.supabase.co`

### ❌ "Failed to fetch"
- Check internet connection
- Verify Supabase project is not paused
- Check if you're using correct region

### ❌ "Email not confirmed"
- Disable email confirmations in Auth settings for development
- Check spam folder for confirmation emails

## Cost Information

### Free Tier Includes:
- ✅ 50,000 monthly active users
- ✅ 500MB database storage
- ✅ 2GB bandwidth
- ✅ 500K API requests
- ✅ Authentication & real-time included

### Perfect for:
- ✅ Development and testing
- ✅ Small to medium apps
- ✅ Proof of concepts

## Security Best Practices

1. **Row Level Security**: Enable RLS on all tables
2. **Environment Variables**: Never commit `.env` to git
3. **API Keys**: Only use anon key in client apps
4. **Database Policies**: Create proper access policies

## Next Steps After Setup

1. **Test Authentication**: Create a user account
2. **Verify Keys**: Check that encryption keys are generated
3. **Add Chat Features**: Implement message storage and real-time updates
4. **Deploy**: Set up production environment

---

Need help? Check the [Supabase Documentation](https://supabase.com/docs) or open an issue in the project repository.
