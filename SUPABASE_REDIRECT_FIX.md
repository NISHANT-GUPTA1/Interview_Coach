# Supabase Project Configuration Update

## Email Confirmation Redirect Issue Fix

The "localhost refused to connect" error happens because your Supabase project is configured to redirect to `http://localhost:3000` but your development server is running on port `3001`.

### Steps to Fix:

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Update Authentication Settings**
   - Go to `Authentication` > `URL Configuration`
   - Find "Site URL" and update it to: `http://localhost:3001`
   - Find "Redirect URLs" and add/update:
     - `http://localhost:3001/auth/callback`
     - `http://localhost:3000/auth/callback` (keep as backup)

3. **Update Google OAuth Settings (if using)**
   - Go to Google Cloud Console: https://console.cloud.google.com
   - Navigate to APIs & Services > Credentials
   - Edit your OAuth 2.0 Client ID
   - Update "Authorized redirect URIs" to include:
     - `http://localhost:3001/auth/callback`

### Alternative: Force Development Server to Port 3000

If you prefer to keep port 3000, add this to your package.json:

```json
{
  "scripts": {
    "dev": "next dev -p 3000"
  }
}
```

Or run: `npm run dev -- -p 3000`

### Current Configuration Check

Your app should be running on: http://localhost:3001
Your Supabase redirect should be: http://localhost:3001/auth/callback

After making these changes, email confirmations should work properly!
