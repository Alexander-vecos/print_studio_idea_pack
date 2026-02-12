import {
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  runTransaction,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "./client";

export const authAdapter = {
  onAuthChange: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  logout: async () => {
    await signOut(auth);
  },

  loginWithKey: async (keyString: string) => {
    const keysRef = collection(db, "keys");
    // Limit 1 is important for security rules if configured to allow list with limit 1
    const q = query(keysRef, where("key", "==", keyString), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Invalid access key.");
    }

    const keyDoc = querySnapshot.docs[0];
    const keyData = keyDoc.data();

    if (keyData.used) {
      throw new Error("This key has already been used.");
    }

    if (keyData.expiresAt && keyData.expiresAt.toMillis() < Date.now()) {
      throw new Error("This key has expired.");
    }

    // Sign in anonymously first
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    try {
      await runTransaction(db, async (transaction) => {
        const keyDocRef = doc(db, "keys", keyDoc.id);
        const userDocRef = doc(db, "users", user.uid);

        const freshKeyDoc = await transaction.get(keyDocRef);
        if (!freshKeyDoc.exists() || freshKeyDoc.data()?.used) {
          throw new Error("Key already used (concurrency protection).");
        }

        transaction.update(keyDocRef, {
          used: true,
          usedBy: user.uid,
          usedAt: serverTimestamp()
        });

        transaction.set(userDocRef, {
          uid: user.uid,
          role: 'user',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          linkedKey: keyString
        }, { merge: true });
      });

      return { uid: user.uid, role: 'user' as const };
    } catch (error: any) {
      await signOut(auth);
      throw error;
    }
  }
};