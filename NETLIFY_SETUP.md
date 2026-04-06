# NRI Neurorecursion Project - Netlify Setup Guide

## Project Overview

This is a SvelteKit-based clinical research signup form with integrated form handling via Netlify Forms (no external services required).

## Quick Start for Netlify Deployment

### Step 1: Prerequisites

- Node.js 18+
- Netlify account (free tier available at https://netlify.com)
- GitHub account (for easy continuous deployment)

### Step 2: Local Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Visit http://localhost:5173
```

### Step 3: Test Form Locally

The form includes:

- Name (required, validated)
- Email (required, validated)
- Message (optional, checked for HTML/SQL injection)
- Conditions (multiple checkboxes)

After submission, the success page displays and auto-redirects to home after 5 seconds.

### Step 4: Build for Production

```bash
# Build the project
npm run build

# This creates the .svelte-kit/netlify directory
```

### Step 5: Deploy to Netlify

#### Method A: GitHub Integration (Recommended)

1. Push your code to GitHub:

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push
```

2. Go to [netlify.com](https://netlify.com)

3. Click "Add new site" → "Import an existing project"

4. Select GitHub and authorize Netlify to access your repositories

5. Choose your repository

6. Netlify will auto-detect settings from `netlify.toml`:
    - Build command: `npm run build`
    - Publish directory: `.svelte-kit/netlify`

7. Click "Deploy site"

Your site will build and deploy automatically! 🚀

#### Method B: Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to your Netlify account
netlify login

# Deploy to production
netlify deploy --prod
```

### Step 6: Form Submission Setup

Netlify Forms captures submissions automatically. No configuration needed!

To view form submissions:

1. Go to your site's Netlify dashboard
2. Select your site
3. Click "Forms" in the left navigation
4. You'll see the "signup" form with all submissions
5. Each submission shows the timestamp and field values

### Step 7: Optional - Email Notifications

To receive email notifications when someone submits the form:

1. In Netlify dashboard, go to "Forms" → "signup"
2. Click "Add notification" → "Email notification"
3. Enter email address(es) to receive alerts
4. Click "Save"

Now you'll get an email each time someone fills out the form!

## Form Submission Flow

```
User fills form
        ↓
Clicks "Submit"
        ↓
Form data sent to Netlify
        ↓
Netlify captures data
        ↓
Success page displays
        ↓
Auto-redirect to home
```

## Accessing Your Site

Once deployed, your site will be live at:

- Default Netlify URL: `https://[random-name].netlify.app`
- Custom domain: Set up under "Domain settings" in your site's Netlify dashboard

### Step 5: Configure Environment Variables on Netlify

After initial deployment:

1. Go to your site on [netlify.com](https://netlify.com)

2. Navigate to **Site Settings** → **Build & Deploy** → **Environment**

3. Add the following variables:
    - `SENDGRID_API_KEY` - Your SendGrid API key
    - `FROM_EMAIL` - Sender email (e.g., noreply@example.com)

4. Redeploy to activate variables:
    ```bash
    netlify deploy --prod
    ```

### Step 6: Set Up SendGrid

1. Create account at [sendgrid.com](https://sendgrid.com)

2. Go to **Settings** → **API Keys**

3. Click "Create API Key"

4. Give it a name like "NRI Netlify"

5. Grant "Mail Send" permissions

6. Copy the key and add to Netlify environment variables

### Step 7: Verify Sender Email

1. In SendGrid, go to **Settings** → **Sender Authentication**

2. Click "Verify an Address"

3. Add the email from `FROM_EMAIL` environment variable

4. Confirm verification via email

## Form Submission Flow

```
User fills form
    ↓
Client-side validation
    ↓
Form submitted (POST)
    ↓
Server-side validation (+page.server.js)
    ↓
Data processed and logged
    ↓
User redirected to /success
    ↓
Success page displays confirmation
    ↓
Auto-redirect to home after 5 seconds
```

## Form Data Handling

Netlify Forms automatically:

- Captures all form field data
- Stores submissions in your Netlify dashboard
- Provides CSV export functionality
- Keeps data indefinitely
- No code or configuration needed

## File Structure

```
neurorecursion/
├── src/
│   ├── routes/
│   │   ├── +page.svelte           # Main page
│   │   ├── +page.server.js        # Form action handler
│   │   └── success/
│   │       └── +page.svelte       # Success page
│   ├── lib/
│   │   ├── SignUp.svelte          # Signup form component
│   │   └── Conditions.js          # Conditions list
│   └── app.css                     # Global styles
├── netlify.toml                    # Netlify configuration
├── svelte.config.js                # SvelteKit configuration
├── NETLIFY_DEPLOYMENT.md           # Detailed deployment guide
├── .env.example                    # Environment variables template
└── package.json                    # Dependencies
```

## Troubleshooting

### Emails not sending

- ✓ Check SendGrid API key is in Netlify environment variables
- ✓ Verify sender email is verified in SendGrid
- ✓ Check SendGrid quota/usage

### Build fails on Netlify

- ✓ Ensure Node.js version matches locally
- ✓ Clear Netlify cache: Site Settings → Build & Deploy → Clear Cache
- ✓ Check build logs for errors

### Form validation not working

- ✓ Clear browser cache
- ✓ Check browser console for JavaScript errors
- ✓ Ensure JavaScript is enabled

### Form submits but success page doesn't show

- ✓ Check Netlify function logs
- ✓ Verify form fields have correct `name` attributes
- ✓ Check browser network tab for errors

## Monitoring

### View submissions

1. Go to Netlify Site Settings
2. Select Build & Deploy → Functions
3. Check logs for submission records

### SendGrid Dashboard

- Monitor email delivery rates
- View bounce/unsubscribe rates
- Check API usage

## Security Notes

- Form validation prevents HTML/SQL injection
- Environment variables never exposed to client
- Serverless functions run securely on Netlify
- No user data stored on frontend

## Support Resources

- **Netlify**: https://docs.netlify.com/
- **SendGrid**: https://sendgrid.com/docs/
- **SvelteKit**: https://kit.svelte.dev/docs
- **SvelteKit + Netlify**: https://docs.netlify.com/integrations/frameworks/sveltekit/

## Performance Metrics

After deployment, check:

- Core Web Vitals in Netlify Analytics
- Build time (should be < 2 minutes)
- Function execution time (should be < 5 seconds)

## Next Steps

1. ✓ Customize form fields as needed
2. ✓ Add additional pages or sections
3. ✓ Set up custom domain
4. ✓ Configure DNS records
5. ✓ Set up SSL certificate (auto from Netlify)
