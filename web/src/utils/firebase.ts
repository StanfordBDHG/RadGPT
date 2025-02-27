//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { env } from "@/env";

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

// Initilize Auth
const auth = getAuth(app);
if (env.VITE_PUBLIC_FIREBASE_EMULATED) {
  connectAuthEmulator(auth, "http://localhost:9099");
}

const storage = getStorage(app);
if (env.VITE_PUBLIC_FIREBASE_EMULATED) {
  connectStorageEmulator(storage, "localhost", 9199);
}

const firestore = getFirestore(app);
if (env.VITE_PUBLIC_FIREBASE_EMULATED) {
  connectFirestoreEmulator(firestore, "localhost", 8080);
}

const functions = getFunctions(app);
if (env.VITE_PUBLIC_FIREBASE_EMULATED) {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export { auth, storage, firestore, functions };
