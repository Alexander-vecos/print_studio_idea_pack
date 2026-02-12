import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const app = initializeApp();

function db() {
  return getFirestore(app);
}

// Callable: activate a key (server-side, safe)
export const activateKey = onCall(async (request) => {
  const { key } = request.data;
  if (!key) throw new HttpsError('invalid-argument', 'Key is required');

  const keysRef = db().collection('keys');
  const q = await keysRef.where('key', '==', key).limit(1).get();
  if (q.empty) throw new HttpsError('not-found', 'Key not found');

  const keyDoc = q.docs[0];
  if (keyDoc.data().used) throw new HttpsError('failed-precondition', 'Key already used');

  await db().runTransaction(async (tx) => {
    const kRef = keysRef.doc(keyDoc.id);
    const fresh = await tx.get(kRef);
    if (!fresh.exists || fresh.data()?.used) {
      throw new HttpsError('failed-precondition', 'Key already used');
    }
    tx.update(kRef, { used: true, usedAt: FieldValue.serverTimestamp() });
    tx.set(db().collection('key_audit').doc(), {
      key, event: 'activated', timestamp: FieldValue.serverTimestamp(),
    });
  });

  return { success: true };
});

// Callable: generate key (admin only)
export const generateKey = onCall(async (request) => {
  if (!request.auth?.token?.admin) {
    throw new HttpsError('permission-denied', 'Only admin can generate keys');
  }

  const key = `KEY-${db().collection('_').doc().id.toUpperCase().slice(0, 12)}`;
  await db().collection('keys').add({
    key,
    createdAt: FieldValue.serverTimestamp(),
    used: false,
    role: 'user',
  });
  return { key };
});

// Callable: list keys (admin only)
export const listKeys = onCall(async (request) => {
  if (!request.auth?.token?.admin) {
    throw new HttpsError('permission-denied', 'Only admin can list keys');
  }

  const docs = await db().collection('keys').orderBy('createdAt', 'desc').get();
  const items = docs.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { items };
});

// Callable: deactivate/delete a key (admin only)
export const deactivateKey = onCall(async (request) => {
  if (!request.auth?.token?.admin) {
    throw new HttpsError('permission-denied', 'Only admin can delete keys');
  }

  const { id } = request.data;
  if (!id) throw new HttpsError('invalid-argument', 'Key id is required');

  await db().collection('keys').doc(id).delete();
  await db().collection('key_audit').add({
    keyId: id, event: 'deleted', by: request.auth!.uid,
    timestamp: FieldValue.serverTimestamp(),
  });
  return { success: true };
});
