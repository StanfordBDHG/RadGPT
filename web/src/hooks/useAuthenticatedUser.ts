//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@utils/firebase";

export default function useAuthenticatedUser() {
  const [currentUser, setCurrentUser] = useState<null | User>(auth.currentUser);
  useEffect(() => auth.onAuthStateChanged(setCurrentUser), []);

  return currentUser;
}
