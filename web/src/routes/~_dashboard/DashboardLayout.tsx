//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { DashboardLayout as DashboardLayoutBase } from "@stanfordspezi/spezi-web-design-system/molecules/DashboardLayout";
import { type ComponentProps } from "react";
import { Helmet } from "react-helmet";
import { AddFileButton } from "./AddFileButton";
import { FileList } from "./FileList";
import { User } from "./User";

interface DashboardLayoutProps
  extends ComponentProps<typeof DashboardLayoutBase> {
  showSideMenu?: boolean;
}

export const DashboardLayout = ({
  showSideMenu = true,
  ...props
}: DashboardLayoutProps) => {
  const sideMenu =
    showSideMenu ?
      <>
        <AddFileButton />
        <div className="mt-4 flex grow flex-col gap-1 lg:w-full">
          <FileList />
        </div>
        <User />
      </>
    : null;

  return (
    <>
      <Helmet>
        <title>RadGPT</title>
      </Helmet>
      <DashboardLayoutBase
        shrinkable={false}
        aside={sideMenu}
        mobile={sideMenu}
        {...props}
      />
    </>
  );
};
