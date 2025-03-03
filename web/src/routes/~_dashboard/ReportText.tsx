//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { useStatefulOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { useState } from "react";
import {
  getGroupMap,
  type ProcessedAnnotations,
} from "@/utils/processedAnnotations";
import { getTextBlocks, type TextMapping } from "@/utils/textMapping";
import { DetailDialog } from "./DetailDialog";

interface ReportTextProp {
  userProvidedText: string;
  selectedFileName: string;
  textMapping: TextMapping | null;
  processedAnnotations: ProcessedAnnotations[];
}

export const ReportText = ({
  userProvidedText,
  selectedFileName,
  textMapping,
  processedAnnotations,
}: ReportTextProp) => {
  const [currentHoveredWordIndex, setCurrentHoveredWordIndex] = useState<
    number | null
  >(null);
  const openState = useStatefulOpenState<{ observationId: number }>();
  const [selectedNumber, setSelectedNumber] = useState<number>();

  if (!textMapping) {
    return (
      <div className="shimmer whitespace-pre-wrap leading-5 tracking-wide">
        {userProvidedText}
      </div>
    );
  }

  const textBlocks = getTextBlocks(textMapping, userProvidedText);
  const groupMap = getGroupMap(processedAnnotations);

  return (
    <>
      <DetailDialog
        openState={openState}
        selectedNumber={selectedNumber}
        setSelectedNumber={setSelectedNumber}
        selectedFileName={selectedFileName}
      />
      <div className="whitespace-pre-wrap leading-5 tracking-wide">
        {textBlocks.map(
          ({
            token: key,
            textString: textSnippet,
            startPosition: id,
            textBlockPosition: position,
          }) => {
            const group = key !== null ? groupMap.get(key) : undefined;

            if (!group)
              return (
                <span key={`${selectedFileName} ${id}`}>{textSnippet}</span>
              );

            const isHovered = group.observationGroup.includes(
              currentHoveredWordIndex ?? -1,
            );

            return (
              <button
                key={`${selectedFileName} ${id}`}
                className={cn(
                  "focus-ring transition-all",
                  isHovered ?
                    [
                      position,
                      group.isLocatedAt ? "bg-yellow-300" : "bg-green-300",
                    ]
                  : "text-blue-700 underline",
                )}
                onMouseEnter={() => setCurrentHoveredWordIndex(key)}
                onMouseLeave={() => setCurrentHoveredWordIndex(null)}
                onClick={() =>
                  openState.open({ observationId: group.observationId })
                }
              >
                {textSnippet}
              </button>
            );
          },
        )}
      </div>
    </>
  );
};
