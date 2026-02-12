/*
  Seed script for demo data (keys + reference entries)
  Usage:
    export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
    node scripts/seed-demo.js
*/

const admin = require('firebase-admin');
const fs = require('fs');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

async function seed() {
  console.log('Seeding demo keys...');

  const keys = [
    { key: 'GUEST-DEMO-001', role: 'guest', used: false },
    { key: 'TEST-KEY-001', role: 'user', used: false },
    { key: 'ADMIN-TEST-001', role: 'admin', used: false },
  ];

  for (const k of keys) {
    const q = db.collection('keys').where('key', '==', k.key);
    const snap = await q.get();
    if (snap.empty) {
      await db.collection('keys').add({ ...k, createdAt: admin.firestore.FieldValue.serverTimestamp(), expiresAt: null });
      console.log('Added key', k.key);
    } else {
      console.log('Key exists', k.key);
    }
  }

  console.log('Seeding done');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });