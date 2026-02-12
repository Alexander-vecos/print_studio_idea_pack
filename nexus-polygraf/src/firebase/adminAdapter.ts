import { getFunctions, httpsCallable } from 'firebase/functions';
import { adminAdapter as legacy } from './adminAdapterLegacy';

const functions = getFunctions();

export const adminAdapter = {
  async generateKey(role: string = 'user') {
    try {
      const fn = httpsCallable(functions, 'generateKey');
      const res = await fn({ role });
      return { key: (res.data as any).key };
    } catch (err: any) {
      // Fallback: use legacy direct Firestore if available (for local dev)
      console.warn('generateKey via functions failed, falling back to Firestore:', err.message || err);
      if (legacy && legacy.generateKey) return legacy.generateKey();
      throw err;
    }
  },

  async listKeys() {
    try {
      const fn = httpsCallable(functions, 'listKeys');
      const res = await fn({});
      return (res.data as any).items;
    } catch (err: any) {
      console.warn('listKeys via functions failed, falling back to Firestore:', err.message || err);
      if (legacy && legacy.listKeys) return legacy.listKeys();
      throw err;
    }
  },

  async deactivateKey(id: string) {
    try {
      const fn = httpsCallable(functions, 'deactivateKey');
      await fn({ id });
      return { success: true };
    } catch (err: any) {
      console.warn('deactivateKey via functions failed, falling back to Firestore:', err.message || err);
      if (legacy && legacy.deactivateKey) return legacy.deactivateKey(id);
      throw err;
    }
  },

  async updateKey(id: string, data: any) {
    // For updates we keep using functions or fallback to Firestore update
    try {
      // No dedicated function for update; attempt to call backend function if exists
      const fn = httpsCallable(functions, 'updateKey');
      if (fn) {
        await fn({ id, data });
        return { success: true };
      }
    } catch (err: any) {
      console.warn('updateKey via functions failed:', err.message || err);
    }

    if (legacy && legacy.updateKey) return legacy.updateKey(id, data);
    throw new Error('updateKey failed');
  },
};

