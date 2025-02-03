/// <reference types="vite/client" />
//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

interface ImportMetaEnv {
  readonly VITE_PUBLIC_FIREBASE_API_KEY: string;
  readonly VITE_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_PUBLIC_FIREBASE_PROJECT_ID: string;
  readonly VITE_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_PUBLIC_FIREBASE_APP_ID: string;
  readonly VITE_PUBLIC_FIREBASE_EMULATED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
