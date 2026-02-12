import {
  doc,
  setDoc,
  getDoc,
  collection,
  writeBatch,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  serverTimestamp,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./client";

const CHUNK_SIZE = 800 * 1024; // ~800KB safe limit

export interface FileData {
  id?: string; // Added ID for lists
  name: string;
  type: string;
  size: number;
  base64: string;
  uploadedBy: string;
  uploadedAt?: Timestamp;
}

export const firestoreAdapter = {
  /**
   * Saves a file, splitting it into chunks if necessary.
   */
  addFile: async (fileData: FileData) => {
    const fileId = crypto.randomUUID();
    const fileRef = doc(db, "files", fileId);
    const batch = writeBatch(db);

    if (fileData.base64.length <= CHUNK_SIZE) {
      batch.set(fileRef, {
        ...fileData,
        uploadedAt: serverTimestamp(),
        isChunked: false,
      });
    } else {
      const totalChunks = Math.ceil(fileData.base64.length / CHUNK_SIZE);

      // Save metadata
      batch.set(fileRef, {
        name: fileData.name,
        type: fileData.type,
        size: fileData.size,
        uploadedBy: fileData.uploadedBy,
        uploadedAt: serverTimestamp(),
        isChunked: true,
        totalChunks: totalChunks,
        base64: null,
      });

      // Save chunks
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = start + CHUNK_SIZE;
        const chunkData = fileData.base64.substring(start, end);

        const chunkRef = doc(collection(db, "files", fileId, "chunks"), i.toString());
        batch.set(chunkRef, { data: chunkData, index: i });
      }
    }

    await batch.commit();
    return fileId;
  },

  getFile: async (fileId: string): Promise<FileData | null> => {
    const fileRef = doc(db, "files", fileId);
    const fileSnap = await getDoc(fileRef);

    if (!fileSnap.exists()) return null;

    const data = fileSnap.data();

    if (!data.isChunked) {
      return { id: fileSnap.id, ...data } as FileData;
    }

    const chunksRef = collection(db, "files", fileId, "chunks");
    const q = query(chunksRef, orderBy("index", "asc"));
    const querySnapshot = await getDocs(q);

    let fullBase64 = "";
    querySnapshot.forEach((doc) => {
      fullBase64 += doc.data().data;
    });

    return {
      id: fileSnap.id,
      name: data.name,
      type: data.type,
      size: data.size,
      uploadedBy: data.uploadedBy,
      uploadedAt: data.uploadedAt,
      base64: fullBase64,
    } as FileData;
  },

  getUserFiles: async (
    userId: string,
    lastDoc: QueryDocumentSnapshot | null = null,
    pageSize = 12
  ) => {
    const filesRef = collection(db, "files");

    let q = query(
      filesRef,
      where("uploadedBy", "==", userId),
      orderBy("uploadedAt", "desc"),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);

    const files: FileData[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        size: data.size,
        uploadedBy: data.uploadedBy,
        uploadedAt: data.uploadedAt,
        base64: "", // Optimization: Don't fetch heavy base64 for list
      } as FileData;
    });

    return {
      files,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
      empty: snapshot.empty,
    };
  },
};