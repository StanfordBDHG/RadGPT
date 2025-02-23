//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { ComponentProps } from "react";
import { SpeziProvider } from "@stanfordspezi/spezi-web-design-system";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

import { AuthenticationProvider } from "../providers/AuthenticationProvider";

import "@/src/main.css";

const routerProps: ComponentProps<typeof SpeziProvider>["router"] = {
  Link: ({ href, ...props }) => <Link to={href} {...props} />,
};

const RootComponent = () => {
  return (
    <AuthenticationProvider>
      <SpeziProvider router={routerProps}>
        <Outlet />
      </SpeziProvider>
    </AuthenticationProvider>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
