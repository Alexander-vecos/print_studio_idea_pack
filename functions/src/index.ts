import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Callable function to activate a key (safe server-side)
export const activateKey = functions.https.onCall(async (data, context) => {
  const { key } = data;
  if (!key) throw new functions.https.HttpsError('invalid-argument', 'Key is required');

  const keysRef = db.collection('keys');
  const q = await keysRef.where('key', '==', key).limit(1).get();
  if (q.empty) {
    throw new functions.https.HttpsError('not-found', 'Key not found');
  }

  const keyDoc = q.docs[0];
  const keyData = keyDoc.data();
  if (keyData.used) {
    throw new functions.https.HttpsError('failed-precondition', 'Key already used');
  }

  // Mark used and create user profile; this runs with admin privileges
  await db.runTransaction(async (tx) => {
    const kRef = keysRef.doc(keyDoc.id);
    const fresh = await tx.get(kRef);
    if (!fresh.exists || fresh.data()?.used) {
      throw new functions.https.HttpsError('failed-precondition', 'Key already used');
    }

    tx.update(kRef, { used: true, usedAt: admin.firestore.FieldValue.serverTimestamp() });

    // create a lightweight audit entry
    const auditRef = db.collection('key_audit').doc();
    tx.set(auditRef, { key: key, event: 'activated', timestamp: admin.firestore.FieldValue.serverTimestamp() });
  });

  return { success: true };
});

// Callable function to generate key (admin only)
export const generateKey = functions.https.onCall(async (data, context) => {
  // Basic auth check: require auth and admin custom claim
  if (!context.auth || !context.auth.token || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admin can generate keys');
  }

  const key = `KEY-${admin.firestore().collection('_').doc().id.toUpperCase().slice(0,12)}`;
  await db.collection('keys').add({ key, createdAt: admin.firestore.FieldValue.serverTimestamp(), used: false, role: 'user' });
  return { key };
});

// Callable function to list keys (admin only)
export const listKeys = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admin can list keys');
  }

  const docs = await db.collection('keys').orderBy('createdAt', 'desc').get();
  const items = docs.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  return { items };
});

// Callable function to deactivate/delete a key (admin only)
export const deactivateKey = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admin can delete keys');
  }

  const { id } = data;
  if (!id) throw new functions.https.HttpsError('invalid-argument', 'Key id is required');

  await db.collection('keys').doc(id).delete();
  // audit
  await db.collection('key_audit').add({ keyId: id, event: 'deleted', by: context.auth.uid, timestamp: admin.firestore.FieldValue.serverTimestamp() });
  return { success: true };
});
