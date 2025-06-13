import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");

const app = !global._firebaseApp
  ? initializeApp({
      credential: serviceAccount.client_email
        ? cert(serviceAccount)
        : applicationDefault(),
    })
  : global._firebaseApp;

if (!global._firebaseApp) global._firebaseApp = app;

export const db = getFirestore(app);