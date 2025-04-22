//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import {
  PopoverArrow,
  PopoverCloseX,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from "@stanfordspezi/spezi-web-design-system/components/Popover";
import { type ReactNode } from "react";

interface DetailPopoverContentProps {
  children?: ReactNode;
}

export const DetailPopoverContent = ({
  children,
}: DetailPopoverContentProps) => (
  <PopoverContent className="flex max-h-(--radix-popper-available-height) w-screen! flex-col gap-4 overflow-auto p-6! lg:w-[820px]!">
    <PopoverArrow className="fill-gray-200" width={12} height={8} />
    <PopoverCloseX />
    <PopoverHeader>
      <PopoverTitle>Detailed Explanation</PopoverTitle>
    </PopoverHeader>
    {children}
  </PopoverContent>
);
