# 🚀 Cloudinary Setup Instructions

## Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com
2. Click "Sign Up for Free"
3. Fill in your details and verify your email
4. Login to your dashboard

## Step 2: Get Your Credentials

In your Cloudinary dashboard, you'll see:

```
Cloud name: dxyz123abc
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123456
```

**Copy these values - you'll need them in Step 4**

## Step 3: Create Upload Preset

1. In Cloudinary dashboard, go to: **Settings → Upload**
2. Click **"Add upload preset"**
3. Configure the preset:
   - **Preset name:** `studypoint_uploads`
   - **Signing Mode:** `Unsigned` ⚠️ **IMPORTANT!**
   - **Folder:** `studypoint/materials` (optional)
   - **Allowed formats:** `jpg,png,gif,pdf,doc,docx,txt,ppt,pptx`
   - **Max file size:** `10000000` (10MB)
4. Click **"Save"**

## Step 4: Update Your .env File

Open the `.env` file in your project root and replace the placeholder values:

```env
# Replace these with your actual Cloudinary credentials
VITE_CLOUDINARY_CLOUD_NAME=dxyz123abc
VITE_CLOUDINARY_API_KEY=123456789012345
VITE_CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
VITE_CLOUDINARY_UPLOAD_PRESET=studypoint_uploads
```

## Step 5: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 6: Test Cloudinary

1. Open your app: http://localhost:5173/
2. Login to your account
3. Go to **Programming → Materials** tab
4. Scroll down to see **"Cloudinary Test"** section
5. Click **"Check Configuration"** - should show ✅ for all items
6. Select a test file and click **"Test Upload"**
7. Should show: **"🎉 Cloudinary is working perfectly!"**

## Step 7: Test File Sharing

1. In the Materials tab, click **"Share Material"**
2. Upload a file - should now use Cloudinary instead of data URLs
3. File should appear in the materials list with a proper URL

## Troubleshooting

### ❌ "Cloud Name not configured"
- Check your `.env` file has the correct `VITE_CLOUDINARY_CLOUD_NAME`
- Restart the development server

### ❌ "Upload Preset not configured"
- Make sure you created the upload preset in Cloudinary dashboard
- Check the preset name is exactly `studypoint_uploads`
- Ensure it's set to "Unsigned" mode

### ❌ "Upload failed: Invalid upload preset"
- The upload preset doesn't exist or is not unsigned
- Go back to Cloudinary dashboard and check the preset settings

### ❌ "Upload failed: Invalid cloud name"
- Double-check your cloud name in the `.env` file
- Make sure there are no extra spaces or quotes

## Security Notes

- The `.env` file is already in `.gitignore` - never commit it to version control
- For production deployment, set these as environment variables in your hosting platform
- The API secret is not used in client-side uploads (only cloud name and upload preset)

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Set environment variables in your hosting platform:
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`
2. You don't need to set API_KEY and API_SECRET for client-side uploads

## File Size and Format Limits

Current limits set in upload preset:
- **Max file size:** 10MB
- **Allowed formats:** jpg, png, gif, pdf, doc, docx, txt, ppt, pptx

To change these:
1. Go to Cloudinary dashboard → Settings → Upload
2. Edit your `studypoint_uploads` preset
3. Modify the limits as needed
