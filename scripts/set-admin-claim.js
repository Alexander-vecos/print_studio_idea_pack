/*
  Usage:
    export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json
    node scripts/set-admin-claim.js <uid>
*/

const admin = require('firebase-admin');
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const auth = admin.auth();

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node set-admin-claim.js <uid>');
  process.exit(1);
}

(async () => {
  try {
    await auth.setCustomUserClaims(uid, { admin: true });
    console.log('Admin claim set for', uid);
  } catch (err) {
    console.error('Failed to set admin claim:', err);
    process.exit(1);
  }
})();