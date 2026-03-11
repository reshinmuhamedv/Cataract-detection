# Supabase Setup Guide

Complete guide to setting up Supabase for the Cataract Detection System.

## Why Supabase?

Supabase provides:
- **Authentication**: Built-in user management
- **Database**: PostgreSQL with real-time capabilities
- **Row Level Security**: Database-level access control
- **Free Tier**: Generous free tier for development

## Step-by-Step Setup

### 1. Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign up with GitHub, Google, or email
4. Verify your email if required

### 2. Create a New Project

1. Click **New Project**
2. Fill in the details:
   - **Name**: `cataract-detection` (or your choice)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to you
   - **Pricing Plan**: Free tier is sufficient

3. Click **Create new project**
4. Wait 2-3 minutes for project initialization

### 3. Database Setup (Already Done!)

The database tables are automatically created when you run the application. The migration includes:

**`detections` table:**
- Stores all cataract detection results
- Linked to authenticated users
- Row Level Security enabled

No manual SQL execution needed! The app handles this automatically.

### 4. Get Your API Credentials

1. In your Supabase project dashboard, click **Project Settings** (gear icon at bottom left)
2. Click **API** in the sidebar
3. You'll see two important sections:

#### Project URL
```
https://xxxxxxxxxxx.supabase.co
```
Copy this entire URL.

#### API Keys
Find the **anon/public** key (NOT the service role key):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
```
Copy this entire key.

### 5. Configure Your Application

Create a file named `.env` in your project root (same folder as `package.json`):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important Notes:**
- Replace the values with YOUR credentials from step 4
- Keep the `VITE_` prefix (required for Vite)
- No quotes needed around the values
- This file is in `.gitignore` and won't be committed

### 6. Verify the Setup

#### Option 1: Using the Application

1. Start your application:
```bash
npm run dev
```

2. Go to `http://localhost:5173`
3. Click **Sign up**
4. Create a test account
5. If you can sign up and access the dashboard, it works!

#### Option 2: Using Supabase Dashboard

1. In Supabase dashboard, go to **Authentication** → **Users**
2. After signing up in your app, you should see the user here
3. Go to **Table Editor** → **detections**
4. After making a detection, you should see records here

## Common Issues and Solutions

### Issue 1: "Missing Supabase environment variables"

**Cause:** `.env` file not found or missing variables

**Solution:**
```bash
# Check if .env exists
ls -la | grep .env

# Create it if missing
cat > .env << EOF
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
EOF

# Restart dev server
npm run dev
```

### Issue 2: "Invalid API key"

**Cause:** Wrong key copied or missing `VITE_` prefix

**Solution:**
1. Double-check you copied the **anon/public** key (not service role)
2. Ensure variables have `VITE_` prefix
3. Restart the dev server

### Issue 3: "Table does not exist"

**Cause:** Database migration not run

**Solution:**
The migrations run automatically. If issues persist:
1. Check Supabase dashboard → SQL Editor
2. Run this query to check if table exists:
```sql
SELECT * FROM detections LIMIT 1;
```
3. If error, contact support with error message

### Issue 4: "Row Level Security policy violation"

**Cause:** RLS is working correctly! This means your security is active.

**Solution:**
1. Make sure you're logged in
2. Check that you're querying with authenticated session
3. Verify user_id matches auth.uid()

### Issue 5: "supabase is not defined"

**Cause:** Supabase client not properly initialized

**Solution:**
1. Check that dependencies are installed:
```bash
npm list @supabase/supabase-js
```
2. If missing:
```bash
npm install @supabase/supabase-js
```
3. Restart dev server

## Security Best Practices

### ✅ DO

- **Use anon/public key** in frontend
- **Keep .env in .gitignore**
- **Enable RLS** on all tables (already done)
- **Use authentication** for protected operations
- **Rotate keys periodically**

### ❌ DON'T

- **Never commit** `.env` to git
- **Never share** your credentials publicly
- **Never use** service role key in frontend
- **Never disable** Row Level Security
- **Don't hardcode** credentials in source

## Environment Variables Explained

### VITE_SUPABASE_URL
- Your project's unique URL
- Used to connect to your specific Supabase instance
- Format: `https://[project-id].supabase.co`

### VITE_SUPABASE_ANON_KEY
- Public API key for client-side operations
- Safe to expose in frontend code
- Combines with RLS for security
- Long JWT token

### Why VITE_ prefix?
Vite only exposes environment variables that start with `VITE_` to the browser for security. This prevents accidentally exposing server-side secrets.

## Testing Your Setup

### Quick Test Script

Create a file `test-supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Test connection
async function test() {
  const { data, error } = await supabase
    .from('detections')
    .select('count');

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('✅ Connection successful!');
    console.log('Detection count:', data);
  }
}

test();
```

Run with:
```bash
node test-supabase.js
```

## Managing Users

### View Users
1. Supabase Dashboard → **Authentication** → **Users**
2. See all registered users
3. View user metadata, email, and sign-up date

### Delete Test Users
1. Click the user row
2. Click **Delete user**
3. Confirm deletion

### Reset User Password
1. Users can reset via the app (implement password reset flow)
2. Or manually via Supabase dashboard → Authentication → Users → Select user → Send password reset email

## Database Management

### View Detection Records
1. Supabase Dashboard → **Table Editor**
2. Select **detections** table
3. View all records (you'll only see your own due to RLS)

### Clear All Detections
```sql
DELETE FROM detections WHERE user_id = auth.uid();
```

### View Database Schema
```sql
\d detections
```

## Advanced: Custom Domain (Optional)

For production, you can use a custom domain:

1. Supabase Dashboard → **Settings** → **API**
2. Click **Custom domains**
3. Follow instructions to set up DNS
4. Update your `.env` file with new domain

## Monitoring and Analytics

### Monitor API Usage
1. Dashboard → **Settings** → **Usage**
2. View:
   - API requests
   - Database size
   - Bandwidth
   - Authentication attempts

### Set Up Alerts
1. Settings → **Billing**
2. Configure email alerts for:
   - Usage limits
   - Unusual activity
   - Billing thresholds

## Backup and Recovery

### Automatic Backups
- Free tier: Daily backups (7-day retention)
- Keep backups of your data outside Supabase

### Manual Backup
```sql
-- Export detections table
COPY (SELECT * FROM detections) TO '/tmp/detections_backup.csv' CSV HEADER;
```

## Support and Resources

### Official Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

### Troubleshooting Resources
- Check Supabase status: [status.supabase.com](https://status.supabase.com)
- Community discussions: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)

## Next Steps

After Supabase is set up:
1. ✅ Test authentication by signing up
2. ✅ Upload an image and check if detection is saved
3. ✅ View your detection history
4. ✅ Check Supabase dashboard for data
5. 📖 Read the main README for more features

## Need Help?

If you're still having issues:
1. Check this guide again carefully
2. Verify your `.env` file is correctly formatted
3. Check browser console for errors (F12)
4. Check terminal for backend errors
5. Ask in project discussions with error messages

Happy detecting! 🚀
