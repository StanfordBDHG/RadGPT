//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { User } from "firebase/auth";
import { createContext } from "react";

export const AuthenticatedUserContext = createContext<User | null>(null);
