//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { SpeziProvider } from "@stanfordspezi/spezi-web-design-system";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AuthenticationProvider } from "../providers/AuthenticationProvider";

import "@stanfordspezi/spezi-web-design-system/style.css";
import "@/main.css";

const RootComponent = () => {
  return (
    <AuthenticationProvider>
      <SpeziProvider>
        <Outlet />
      </SpeziProvider>
    </AuthenticationProvider>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
