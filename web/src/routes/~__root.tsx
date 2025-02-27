//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { SpeziProvider } from "@stanfordspezi/spezi-web-design-system";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { type ComponentProps } from "react";
import {
  AuthenticatedUserContext,
  useAuthenticatedUserContextProvider,
} from "@/modules/user";
import "@/main.css";

const routerProps: ComponentProps<typeof SpeziProvider>["router"] = {
  Link: ({ href, ...props }) => <Link to={href} {...props} />,
};

const RootComponent = () => (
  <AuthenticatedUserContext.Provider
    value={useAuthenticatedUserContextProvider()}
  >
    <SpeziProvider router={routerProps}>
      <Outlet />
    </SpeziProvider>
  </AuthenticatedUserContext.Provider>
);

export const Route = createRootRoute({
  component: RootComponent,
});
