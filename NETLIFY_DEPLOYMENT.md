# Netlify Deployment Guide

This SvelteKit project is configured for deployment on Netlify with built-in form handling using Netlify Forms.

## Prerequisites

- Node.js 18+ installed
- A Netlify account (free tier available at https://netlify.com)
- GitHub repository with your code pushed

## Quick Start

### 1. Local Development

```bash
npm install
npm run dev
```

### 2. Build for Production

```bash
npm run build
```

### 3. Deploy to Netlify

#### Option A: Connect GitHub (Recommended)

1. Push your code to GitHub
2. Go to https://netlify.com and sign in
3. Click "Add new site" → "Import an existing project"
4. Select GitHub as your provider
5. Choose your repository
6. Click "Deploy"

Netlify will automatically detect the `netlify.toml` configuration and build your site.

#### Option B: Using Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to your Netlify account
netlify login

# Deploy to production
netlify deploy --prod
```

## Form Handling

This project uses **Netlify Forms**, a built-in feature that requires no external dependencies or API keys.

### How It Works

1. The form has a `form-name="signup"` attribute that tells Netlify to capture submissions
2. When a user submits the form, Netlify automatically captures the data
3. Form data is visible in your Netlify dashboard under "Forms"

### Accessing Form Submissions

1. Log into your Netlify dashboard
2. Select your site
3. Go to "Forms" in the left navigation
4. Click "signup" to view all submissions
5. You can see field values, timestamps, and export data as CSV

### Email Notifications (Optional)

To receive email notifications when someone submits the form:

1. In your site's Netlify dashboard, go to "Forms" → "signup"
2. Scroll to "Form notifications"
3. Click "Add notification" → "Email notification"
4. Enter the email address(es) where you want to receive notifications
5. Click "Save"

Now you'll receive an email each time someone fills out the form.

### Export Form Data

You can export all form submissions as a CSV file:

1. Go to "Forms" → "signup" in your Netlify dashboard
2. Click the three dots menu (⋮) → "Download CSV"
3. Save the file to your computer

## Deployment Status

- ✅ SvelteKit configured with Netlify adapter
- ✅ Form handling with Netlify Forms
- ✅ Build configuration in `netlify.toml`
- ✅ No external dependencies or API keys needed

## Troubleshooting

### Form submissions not appearing?

- Make sure the form has `form-name="signup"` attribute
- Check that you're looking at the correct form in your Netlify dashboard
- Try waiting a few minutes for the data to sync

### Build failing?

- Check your build logs in the Netlify dashboard
- Make sure Node.js version is 18+
- Verify all dependencies are listed in `package.json`

## Next Steps

After deploying:

1. Test the form by filling it out
2. Check your Netlify dashboard for the submission
3. If you set up email notifications, verify you receive the email
4. Share your site URL with others!
5. Go to https://netlify.com
6. Click "New site from Git"
7. Select GitHub and authorize
8. Choose your repository
9. Build settings are auto-detected from `netlify.toml`
10. Deploy

### 5. Set Environment Variables on Netlify

After deployment:

1. Go to your site settings on Netlify
2. Navigate to **Build & Deploy** → **Environment**
3. Add the following environment variables:
    - `SENDGRID_API_KEY` - Your SendGrid API key
    - `FROM_EMAIL` - The email address to send from (e.g., noreply@example.com)
    - `CONTACT_EMAIL_TO` - zippyskippy@gmail.com (for reference, the address is hardcoded in the form handler)

### 6. Form Submissions

Form submissions will be:

1. Validated on the client side
2. Submitted to Netlify Forms
3. Data automatically captured and stored
4. User redirected to success page
5. Optional: Email notification sent (if configured)
6. Add the API key to Netlify environment variables

## Builder Options

### Form Inputs

- **name** - User's full name (required)
- **email** - User's email address (required)
- **message** - Optional message (plain text only, no HTML/SQL)
- **conditions** - Multiple checkboxes for neurological conditions

### Form Validation

- Client-side validation prevents submission of invalid data
- Server-side validation ensures data integrity
- Message field checked for HTML/SQL injection attempts

## Troubleshooting

### Forms Not Sending Emails

- Check that SendGrid API key is correctly set in Netlify environment variables
- Check SendGrid quota hasn't been exceeded
- Check CloudWatch logs in Netlify dashboard

### Build Failures

- Ensure Node.js version is 18+
- Check `npm run build` works locally
- Review build logs in Netlify dashboard

### Form Not Validating

- Clear browser cache
- Check browser console for JavaScript errors
- Ensure JavaScript is enabled

## Build Commands

The build process automatically runs:

```bash
npm run build
```

This includes:

- Building the SvelteKit app
- Bundling for Netlify hosting

## Project Structure

```
/
├── src/
│   ├── routes/
│   │   ├── +page.svelte      # Main page
│   │   ├── +page.server.js   # Server actions
│   │   └── success/          # Success page after submission
│   ├── lib/
│   │   ├── SignUp.svelte     # SignUp form component
│   │   └── Conditions.js     # Neurological conditions data
│   └── app.css               # Global styles
├── netlify.toml              # Netlify configuration
└── svelte.config.js          # SvelteKit configuration
```

## Support

For issues with:

- **Netlify**: https://support.netlify.com
- **SvelteKit**: https://kit.svelte.dev
- **Netlify Forms**: https://docs.netlify.com/forms/overview
