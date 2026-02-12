import {
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  runTransaction,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from './client';

export interface UserProfile {
  uid: string;
  role: 'admin' | 'user' | 'guest';
  phoneNumber?: string;
  createdAt?: Timestamp;
  lastLogin?: Timestamp;
}

/**
 * Auth Adapter - все операции с Firebase Auth и связанное управление пользователями
 */
export const authAdapter = {
  /**
   * Слушать изменения статуса авторизации
   */
  onAuthChange: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Выход из системы
   */
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout');
    }
  },

  /**
   * Вход пользователя по ключу доступа
   * Процесс:
   * 1. Найти документ ключа в Firestore
   * 2. Проверить, что ключ не использован и не истёк
   * 3. Войти анонимно
   * 4. В транзакции: помечить ключ использованным и создать документ пользователя
   */
  loginWithKey: async (keyString: string): Promise<UserProfile> => {
    try {
      // Special guest key allowed
      const GUEST_KEY = 'GUEST-DEMO-001';
      if (keyString.trim().toUpperCase() === GUEST_KEY) {
        // Delegate to guest login
        return await (authAdapter as any).loginAsGuest();
      }

      // Поиск ключа в Firestore
      const keysRef = collection(db, 'keys');
      const q = query(
        keysRef,
        where('key', '==', keyString),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Invalid access key');
      }

      const keyDoc = querySnapshot.docs[0];
      const keyData = keyDoc.data();

      // Проверка статуса ключа
      if (keyData.used) {
        throw new Error('This key has already been used');
      }

      if (keyData.expiresAt && keyData.expiresAt.toMillis() < Date.now()) {
        throw new Error('This key has expired');
      }

      // Вход анонимно
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Транзакция: помечить ключ и создать пользователя
      const userProfile: UserProfile = { uid: user.uid, role: 'user' };

      await runTransaction(db, async (transaction) => {
        const keyDocRef = doc(db, 'keys', keyDoc.id);
        const userDocRef = doc(db, 'users', user.uid);

        // Защита от race condition
        const freshKeyDoc = await transaction.get(keyDocRef);
        if (!freshKeyDoc.exists() || freshKeyDoc.data()?.used) {
          throw new Error('Key already used (concurrency protection)');
        }

        // Помечить ключ использованным
        transaction.update(keyDocRef, {
          used: true,
          usedBy: user.uid,
          usedAt: serverTimestamp(),
        });

        // Создать документ пользователя
        transaction.set(
          userDocRef,
          {
            uid: user.uid,
            role: 'user',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            linkedKey: keyString,
          },
          { merge: true }
        );
      });

      return userProfile;
    } catch (error: any) {
      console.error('Login with key error:', error);
      // Выход из анонимной сессии в случае ошибки
      try {
        await signOut(auth);
      } catch {}
      throw error;
    }
  },

  // Guest login - quick demo account (sign-in anonymously and mark as guest)
  loginAsGuest: async (): Promise<UserProfile> => {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      // Create or update guest profile
      await (await import('firebase/firestore')).setDoc(userDocRef, {
        uid: user.uid,
        role: 'guest',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isGuest: true,
      }, { merge: true });

      return { uid: user.uid, role: 'guest' };
    } catch (error: any) {
      console.error('Guest login error:', error);
      try { await signOut(auth); } catch {}
      throw new Error(error.message || 'Guest login failed');
    }
  },

  // ---- Email/Password Auth ----
  loginWithEmail: async (email: string, password: string): Promise<UserProfile> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      await (await import('firebase/firestore')).setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        role: 'user',
        lastLogin: serverTimestamp(),
      }, { merge: true });

      return { uid: user.uid, role: 'user' };
    } catch (error: any) {
      console.error('loginWithEmail error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        throw new Error('Неверный email или пароль');
      }
      if (error.code === 'auth/wrong-password') {
        throw new Error('Неверный пароль');
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Слишком много попыток. Подождите.');
      }
      throw new Error(error.message || 'Ошибка входа');
    }
  },

  registerWithEmail: async (email: string, password: string): Promise<UserProfile> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      await (await import('firebase/firestore')).setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        role: 'user',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      }, { merge: true });

      return { uid: user.uid, role: 'user' };
    } catch (error: any) {
      console.error('registerWithEmail error:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Этот email уже зарегистрирован');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Пароль слишком простой (мин. 6 символов)');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Некорректный email');
      }
      throw new Error(error.message || 'Ошибка регистрации');
    }
  },

  /**
   * Вход администратора через custom token
   * Используется Cloud Function для MINT custom token после верификации OTP
   */
  loginWithCustomToken: async (customToken: string) => {
    try {
      const userCredential = await signInWithCustomToken(auth, customToken);
      const user = userCredential.user;

      // Получить роль из Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await (await import('firebase/firestore')).getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new Error('User profile not found in database');
      }

      const userData = userDocSnap.data();

      return {
        uid: user.uid,
        role: userData.role || 'user',
        phoneNumber: userData.phoneNumber,
        lastLogin: userData.lastLogin,
      };
    } catch (error: any) {
      console.error('Login with custom token error:', error);
      throw new Error(error.message || 'Authentication failed');
    }
  },

  /**
   * Получить текущего авторизованного пользователя
   */
  getCurrentUser: (): FirebaseUser | null => {
    return auth.currentUser;
  },
};
