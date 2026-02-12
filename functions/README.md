# Cloud Functions (skeleton)

This folder contains a small skeleton of Cloud Functions for PrintStudio.

Files:
- `src/index.ts` - contains `activateKey` and `generateKey` callable functions.

Local testing / deployment:

1. Install Firebase CLI and set project
```bash
npm i -g firebase-tools
firebase login
firebase use --add your-project-id
```

2. Run emulator locally
```bash
# from repo root
firebase emulators:start --only functions,firestore
```

3. Deploy functions to project
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

Security:
- `generateKey` checks for `context.auth.token.admin` custom claim. Set claims via Admin SDK or Cloud Console.
- `activateKey` runs as admin and updates `keys` and `key_audit` collection.
