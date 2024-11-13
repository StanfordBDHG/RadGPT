//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { useContext } from "react";
import { AuthenticatedUserContext } from "../context/AuthenticatedUserContext";

export function useAuthenticatedUser() {
  return useContext(AuthenticatedUserContext);
}
