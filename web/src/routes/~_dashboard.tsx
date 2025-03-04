//
// This source file is part of the Stanford Biodesign Digital Health ENGAGE-HF open-source project
//
// SPDX-FileCopyrightText: 2023 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { ErrorState } from "@stanfordspezi/spezi-web-design-system/components/ErrorState";
import { Spinner } from "@stanfordspezi/spezi-web-design-system/components/Spinner";
import { StateContainer } from "@stanfordspezi/spezi-web-design-system/components/StateContainer";
import { PageTitle } from "@stanfordspezi/spezi-web-design-system/molecules/DashboardLayout";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ShieldX } from "lucide-react";
import { auth } from "@/modules/firebase/app";
import { DashboardLayout } from "./~_dashboard/DashboardLayout";

export const Route = createFileRoute("/_dashboard")({
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
  pendingComponent: () => (
    <DashboardLayout>
      <StateContainer grow className="min-h-screen">
        <Spinner />
      </StateContainer>
    </DashboardLayout>
  ),
  errorComponent: ({ error }) => (
    <DashboardLayout title={<PageTitle title="Error" icon={<ShieldX />} />}>
      <StateContainer grow>
        <ErrorState>
          Unhandled error happened. Please try again later.
          <br />
          Message: {error.message}
        </ErrorState>
      </StateContainer>
    </DashboardLayout>
  ),
});
