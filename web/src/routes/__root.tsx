//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen">
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Login
        </Link>{" "}
        <span>|</span>
        <Link to="/protected_page" className="[&.active]:font-bold">
          Protected Page
        </Link>
      </div>
      <hr />
      <Outlet />
    </div>
  ),
});
