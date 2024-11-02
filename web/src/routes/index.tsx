//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@utils/firebase.ts";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  OAuthProvider,
} from "firebase/auth";
import { AsideBrandLayout } from "@stanfordspezi/spezi-web-design-system/molecules/AsideBrandLayout";
import { SignInForm } from "@stanfordspezi/spezi-web-design-system/modules/auth";
import { Helmet } from "react-helmet";

const IndexComponent = () => {
  const appleProvider = new OAuthProvider("apple.com");
  const googleProvider = new GoogleAuthProvider();
  const providers = [
    {
      name: "Google",
      provider: googleProvider,
    },
    { name: "Apple", provider: appleProvider },
  ];

  const asidePictureComponent = (
    <div className="min-h-full flex flex-column flex-center">
      <img
        src="/biodesign-footer-light.png"
        alt="Stanford Biodesign Logo"
        className="w-[317px]"
      />
    </div>
  )

  return (
    <>
      <Helmet>
        <title>Sign In - RadGPT</title>
      </Helmet>
      <AsideBrandLayout aside={asidePictureComponent}>
        <SignInForm
          auth={auth}
          providers={providers}
          signInWithPopup={signInWithPopup}
          enableEmailPassword={false}
          signInWithEmailAndPassword={signInWithEmailAndPassword}
        />
      </AsideBrandLayout>
    </>
  );
};

export const Route = createFileRoute("/")({
  component: IndexComponent,
  beforeLoad: async ({ location }) => {
    // loading screen?
    await auth.authStateReady();
    if (auth.currentUser)
      throw redirect({
        to: "/protected_page",
        search: {
          redirect: location.href,
        },
      });
  },
});
