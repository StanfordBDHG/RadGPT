//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//
import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@utils/firebase.ts";
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";

const ProtectedComponent = () => {
  const currentUser = useAuthenticatedUser();
  return (
    <>
      <h1 className="text-3xl">Protected Screen</h1>
      <p className="text-s py-2">
        {currentUser?.email ?? "no user authenticated"}
      </p>
    </>
  );
};

export const Route = createFileRoute("/protected_page")({
  component: ProtectedComponent,
  beforeLoad: async ({ location }) => {
    await auth.authStateReady();
    if (!auth.currentUser)
      throw redirect({
        to: "/",
        search: {
          redirect: location.href,
        },
      });
  },
});
