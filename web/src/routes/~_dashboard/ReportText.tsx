//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import {
  getGroupMap,
  ProcessedAnnotations,
} from "@/src/utils/processedAnnotations";
import { getTextBlocks, TextMapping } from "@/src/utils/textMapping";
import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { useState } from "react";

interface ReportTextProp {
  userProvidedText: string;
  selectedFileName: string;
  textMapping: TextMapping;
  processedAnnotations: ProcessedAnnotations[];
}

export default function ReportText({
  userProvidedText,
  selectedFileName,
  textMapping,
  processedAnnotations,
}: ReportTextProp) {
  const [currentHoveredWordIndex, setCurrentHoveredWordIndex] = useState<
    number | null
  >(null);

  const textBlocks = getTextBlocks(textMapping, userProvidedText);
  const groupMap = getGroupMap(processedAnnotations);
  return (
    <>
      <div className="whitespace-pre-wrap tracking-wide leading-5">
        {textBlocks.map(([key, textSnippet, id, position]) => (
          <span
            key={`${selectedFileName} ${id}`}
            className={cn(
              currentHoveredWordIndex &&
                key &&
                (groupMap.get(key) ?? []).includes(currentHoveredWordIndex)
                ? `bg-green-300 transition-color cursor-pointer keyword-highlight${position}`
                : "",
              key &&
                !(groupMap.get(key) ?? []).includes(
                  currentHoveredWordIndex ?? -1,
                )
                ? "underline text-blue-700"
                : "",
            )}
            onMouseEnter={() => setCurrentHoveredWordIndex(key)}
            onMouseLeave={() => setCurrentHoveredWordIndex(null)}
          >
            {textSnippet}
          </span>
        ))}
      </div>
    </>
  );
}
