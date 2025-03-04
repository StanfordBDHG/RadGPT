//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/modules/firebase/app";
import { DashboardLayout } from "./DashboardLayout";

const Dashboard = () => (
  <DashboardLayout>
    <p>Please add or select a file</p>
  </DashboardLayout>
);

export const Route = createFileRoute("/_dashboard/")({
  component: Dashboard,
  beforeLoad: async ({ location }) => {
    await auth.authStateReady();
    if (!auth.currentUser) {
      throw redirect({
        to: "/signin",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
