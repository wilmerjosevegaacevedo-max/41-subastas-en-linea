import { type App, cert, getApps, initializeApp } from "firebase-admin/app";
import { type Firestore, getFirestore } from "firebase-admin/firestore";
import { DomainError } from "./errors";

let adminApp: App | null = null;
let firestoreDb: Firestore | null = null;

export function getFirebaseAdminApp(): App {
  if (adminApp !== null) {
    return adminApp;
  }

  const existingApps = getApps();
  const firstApp = existingApps[0];
  if (firstApp !== undefined) {
    adminApp = firstApp;
    return adminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId === undefined || clientEmail === undefined || rawPrivateKey === undefined) {
    throw new DomainError("INTERNAL_ERROR", "Credenciales de Firebase Admin incompletas");
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return adminApp;
}

export function getFirestoreDb(): Firestore {
  if (firestoreDb !== null) {
    return firestoreDb;
  }

  const app = getFirebaseAdminApp();
  firestoreDb = getFirestore(app);
  return firestoreDb;
}
