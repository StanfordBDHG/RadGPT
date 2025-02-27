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
    <div className="min-h-full flex-center flex-col">
      <img
        src="/MIDRC-Logo-Vertical-Version-with-a-lighter-gray.png"
        alt="Stanford Biodesign Logo"
        className="w-[317px]"
      />
      <p className="text-sm px-10 text-center">
        This work was supported in part by MIDRC (The Medical Imaging and Data
        Resource Center) with funding from the National Institute of Biomedical
        Imaging and Bioengineering (NIBIB) of the National Institutes of Health
        under contract 75N92020D00021 and the Advanced Research Projects Agency
        for Health (ARPA-H) under contract 5N92023F00002.
      </p>
    </div>
  );

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

export const Route = createFileRoute("/signin/")({
  component: IndexComponent,
  beforeLoad: async ({ location }) => {
    // loading screen?
    await auth.authStateReady();
    if (auth.currentUser)
      throw redirect({
        to: "/",
        search: {
          redirect: location.href,
        },
      });
  },
});
