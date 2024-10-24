//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@utils/firebase.ts";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";
import { Button } from "@stanfordbdhg/spezi-web-design-system";

const IndexComponent = () => {
  const currentUser = useAuthenticatedUser();

  const signInWithGoogle = async () =>
    await signInWithPopup(auth, new GoogleAuthProvider());
  const signOut = async () => await auth.signOut();

  return (
    <>
      <h1 className="text-3xl">Login Screen</h1>
      {!currentUser ? (
        <Button className="my-2" onClick={signInWithGoogle}>
          SignIn With Google
        </Button>
      ) : (
        <>
          <p className="text-s py-2">
            Current logged in user:
            {currentUser.email}
          </p>
          <Button onClick={signOut}>Sign Out</Button>
        </>
      )}
    </>
  );
};

export const Route = createFileRoute("/")({
  component: IndexComponent,
});
