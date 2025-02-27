//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { useNavigate } from "@tanstack/react-router";
import { type User } from "firebase/auth";
import { type ReactNode, useState } from "react";
import { auth } from "@/utils/firebase";
import { AuthenticatedUserContext } from "../context/AuthenticatedUserContext";

interface AuthenticationProviderProps {
  children?: ReactNode;
}

export const AuthenticationProvider = ({
  children,
}: AuthenticationProviderProps) => {
  const [currentUser, setCurrentUser] = useState<null | User>(auth.currentUser);
  const navigate = useNavigate();

  auth.onAuthStateChanged((newUser) => {
    if (newUser && window.location.pathname === "/signin") {
      void navigate({ to: "/" });
    } else if (!newUser) {
      void navigate({ to: "/signin" });
    }
    setCurrentUser(newUser);
  });

  return (
    <AuthenticatedUserContext.Provider value={currentUser}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};
