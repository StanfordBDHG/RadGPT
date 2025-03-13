//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { env } from "@/env";
import { getCallables } from "./getCallables";
import { getDocumentsRefs } from "./refs";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: env.VITE_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.VITE_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
if (env.VITE_PUBLIC_FIREBASE_EMULATED) {
  connectAuthEmulator(auth, "http://localhost:9099");
}

export const storage = getStorage(app);
if (env.VITE_PUBLIC_FIREBASE_EMULATED) {
  connectStorageEmulator(storage, "localhost", 9199);
}

export const firestore = getFirestore(app);
if (env.VITE_PUBLIC_FIREBASE_EMULATED) {
  connectFirestoreEmulator(firestore, "localhost", 8080);
}

export const functions = getFunctions(app);
if (env.VITE_PUBLIC_FIREBASE_EMULATED) {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export const callables = getCallables(functions);

export const docRefs = getDocumentsRefs(firestore);

/**
 * Use this in auth-protected routes only!
 * */
export const getCurrentUser = () => {
  if (!auth.currentUser) throw new Error("UNAUTHENTICATED");
  return auth.currentUser;
};
