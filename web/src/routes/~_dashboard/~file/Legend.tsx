//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import {
  Card,
  CardHeader,
  CardTitle,
} from "@stanfordspezi/spezi-web-design-system";
import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { type ReactNode } from "react";

interface LegendItemProps {
  color: string;
  content: ReactNode;
}

export const LegendItem = ({ color, content }: LegendItemProps) => (
  <li className="flex items-center gap-2 text-sm">
    <div className={cn("size-3 shrink-0 rounded-full", color)} />
    <span>{content}</span>
  </li>
);

export const Legend = () => (
  <Card className="mb-8 flex flex-col pb-4">
    <CardHeader className="mb-2! flex-col items-stretch sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <CardTitle>Legend</CardTitle>
      <p className="text-muted-foreground text-sm">
        Click on highlighted terms for detailed explanation
      </p>
    </CardHeader>
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5">
      <LegendItem color="bg-green-300" content="Medical Observation" />
      <LegendItem color="bg-yellow-300" content="Anatomic Location" />
    </ul>
  </Card>
);
