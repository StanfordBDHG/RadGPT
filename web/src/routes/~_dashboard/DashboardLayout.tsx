//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

// This has been copied from the Spezi Design System and modified to fit the needs of this project
// The Dashboard Layout in the Spezi Design System will modified when the requirements for a dashboard layout
// for this project are clearer

import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { useOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { Menu } from "lucide-react";
import { type ReactNode } from "react";
import { Helmet } from "react-helmet";
import { SideMenu } from "./SideMenu";

export interface DashboardLayoutProps {
  title?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  showSideMenu?: boolean;
}

export const DashboardLayout = ({
  title,
  actions,
  children,
  showSideMenu = true,
}: DashboardLayoutProps) => {
  const menu = useOpenState();
  const sideMenu = showSideMenu ? <SideMenu /> : null;

  return (
    <>
      <Helmet>
        <title>RadGPT</title>
      </Helmet>
      <div className="text-foreground [--asideWidth:86px] [--headerHeight:72px] lg:[--asideWidth:240px] lg:[--headerHeight:86px] [&_*]:[box-sizing:border-box]">
        <header className="border-b-border-layout flex h-[--headerHeight] items-center gap-4 border-x-0 border-b border-t-0 border-solid px-4 py-1 lg:ml-[--asideWidth] lg:hidden xl:px-8">
          {title}
          <div className="ml-auto gap-4">
            {actions}
            <Button
              onClick={menu.toggle}
              aria-label={`${menu.isOpen ? "Close" : "Open"} menu`}
              className="ml-4 lg:hidden"
            >
              <Menu />
            </Button>
          </div>
        </header>
        <aside className="border-r-border-layout fixed left-0 top-0 hidden h-screen w-[--asideWidth] flex-col items-center border-y-0 border-l-0 border-r border-solid bg-surface py-4 lg:flex xl:px-3">
          {sideMenu}
        </aside>
        <nav
          className={cn(
            "fixed left-0 right-0 top-[calc(var(--headerHeight)+1px)] flex h-[calc(100vh-var(--headerHeight)-1px)] w-screen flex-col overflow-y-auto bg-surface transition duration-300 lg:hidden",
            menu.isOpen ? "z-10 translate-x-0" : (
              "pointer-events-none -translate-x-24 opacity-0"
            ),
          )}
          hidden={!menu.isOpen}
        >
          {actions && <div className="p-4">{actions}</div>}
          {sideMenu}
        </nav>
        <div className="flex min-h-[calc(100vh-var(--headerHeight))] flex-col px-4 pb-12 pt-6 md:px-12 md:pb-16 md:pt-10 lg:ml-[--asideWidth]">
          {children}
        </div>
      </div>
    </>
  );
};
