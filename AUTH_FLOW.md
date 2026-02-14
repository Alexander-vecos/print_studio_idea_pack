# Phone Authentication Flow (Simple Guide)

This doc explains step-by-step how phone authentication works and how to test it locally.

1. Overview
   - We use Firebase Phone Auth with invisible reCAPTCHA for web.
   - The client triggers `sendPhoneOtp(phone)` which displays the invisible reCAPTCHA and sends an SMS with OTP.
   - The client then calls `verifyPhoneOtp(code)` to confirm the code and sign in.
   - After successful sign-in we create/update a `users/{uid}` doc with a default role `guest`.

2. How to test locally
   - Ensure `.env.local` contains your Firebase config for the project.
   - Run `npm run dev` in `nexus-polygraf`.
   - Open the app in the browser. The key modal will open; press "Or sign in with phone".
   - Enter an allowed test phone (or real phone) and submit; check SMS and confirm code.

3. Notes & Troubleshooting
   - If you use a custom domain or `localhost`, ensure your Firebase console allows your origin for Phone Auth.
   - For testing without SMS costs use Firebase Console -> Authentication -> Sign-in methods -> Phone -> Add test phone number and verification code.
   - If reCAPTCHA does not render, check browser console for errors and ensure `recaptcha-container` exists in DOM.

4. Android OAuth Setup
   - For Android OAuth 2.0 configuration with SHA1 fingerprints, see [ANDROID_OAUTH_SETUP.md](./ANDROID_OAUTH_SETUP.md)
   - Includes complete guide for setting up Google Sign-In on Android devices
