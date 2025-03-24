//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { DashboardLayout as DashboardLayoutBase } from "@stanfordspezi/spezi-web-design-system/molecules/DashboardLayout";
import { FilePlus } from "lucide-react";
import { type ComponentProps } from "react";
import { Helmet } from "react-helmet";
import { AddFileDialog } from "./AddFileDialog";
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
        <AddFileDialog>
          <Button className="mx-auto mt-4 lg:mt-2">
            <FilePlus />
            Add New Report
          </Button>
        </AddFileDialog>
        <div className="mt-8 flex grow flex-col gap-1 lg:w-full">
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
