//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { SpeziProvider, Toaster } from "@stanfordspezi/spezi-web-design-system";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { type ComponentProps } from "react";
import { ReactQueryClientProvider } from "@/modules/query/ReactQueryClientProvider";
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
    <ReactQueryClientProvider>
      <SpeziProvider router={routerProps}>
        <Outlet />
        <Toaster />
      </SpeziProvider>
    </ReactQueryClientProvider>
  </AuthenticatedUserContext.Provider>
);

export const Route = createRootRoute({
  component: RootComponent,
});
