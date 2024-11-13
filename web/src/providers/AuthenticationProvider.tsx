//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { ReactNode, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AuthenticatedUserContext } from "../context/AuthenticatedUserContext";
import { User } from "firebase/auth";
import { auth } from "@utils/firebase";

interface AuthenticationProviderProps {
  children?: ReactNode;
}

export const AuthenticationProvider = ({
  children,
}: AuthenticationProviderProps) => {
  const [currentUser, setCurrentUser] = useState<null | User>(auth.currentUser);
  const navigate = useNavigate();

  auth.onAuthStateChanged((newUser) => {
    if (newUser && window.location.pathname === "/") {
      navigate({ to: "/protected_page" });
    } else if (!newUser) {
      navigate({ to: "/" });
    }
    setCurrentUser(newUser);
  });

  return (
    <AuthenticatedUserContext.Provider value={currentUser}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};
