# Quick Deploy (Hosting + Functions)

1. Install Firebase CLI and login:

```bash
npm install -g firebase-tools
firebase login
firebase use --add your-project-id
```

2. Build frontend and deploy hosting + functions:

```bash
# from nexus-polygraf
npm run build
# from repo root
firebase deploy --only hosting:nexuspolygraf,functions
```

3. Seed demo data (optional):

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
node scripts/seed-demo.js
```

4. Start emulators for local testing (functions + firestore):

```bash
firebase emulators:start --only functions,firestore
```

Notes:
- Add `FIREBASE_TOKEN` and `GOOGLE_APPLICATION_CREDENTIALS` as GitHub Secrets for CI/CD deployments.
- Use the functions emulator to test callable functions locally before deploying.
