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

const IndexComponent = () => {
  const currentUser = useAuthenticatedUser();

  const signInWithGoogle = async () =>
    await signInWithPopup(auth, new GoogleAuthProvider());
  const signOut = async () => await auth.signOut();

  return (
    <>
      <h1 className="text-3xl">Login Screen</h1>
      {!currentUser ? (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 my-2 px-4 rounded"
          onClick={signInWithGoogle}
        >
          SignIn With Google
        </button>
      ) : (
        <>
          <p className="text-s py-2">
            Current logged in user:
            {currentUser.email}
          </p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={signOut}
          >
            Sign Out
          </button>
        </>
      )}
    </>
  );
};

export const Route = createFileRoute("/")({
  component: IndexComponent,
});
