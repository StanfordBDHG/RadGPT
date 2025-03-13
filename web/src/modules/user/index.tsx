//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { useNavigate } from "@tanstack/react-router";
import { type User } from "firebase/auth";
import { createContext, useContext, useState } from "react";
import { auth } from "@/modules/firebase/app";

export const useAuthenticatedUserContextProvider = () => {
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

  return currentUser;
};

export const AuthenticatedUserContext =
  createContext<ReturnType<typeof useAuthenticatedUserContextProvider>>(null);

export const useAuthenticatedUser = () => useContext(AuthenticatedUserContext);
