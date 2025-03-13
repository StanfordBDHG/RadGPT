//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { EmptyState } from "@stanfordspezi/spezi-web-design-system/components/EmptyState";
import { StateContainer } from "@stanfordspezi/spezi-web-design-system/components/StateContainer";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "./DashboardLayout";

const Dashboard = () => (
  <DashboardLayout>
    <StateContainer>
      <EmptyState>Please add or select a report.</EmptyState>
    </StateContainer>
  </DashboardLayout>
);

export const Route = createFileRoute("/_dashboard/")({
  component: Dashboard,
});
