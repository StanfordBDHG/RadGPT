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
import { getGroupMap } from "@/modules/files/processedAnnotations";
import { type FileDetails } from "@/modules/files/queries";
import { getTextBlocks } from "@/modules/files/textMapping";
import { DetailDialog } from "@/routes/~_dashboard/~file/DetailDialog";

interface ReportTextProp {
  file: FileDetails;
}

export const ReportText = ({ file }: ReportTextProp) => {
  const [currentHoveredWordIndex, setCurrentHoveredWordIndex] = useState<
    number | null
  >(null);
  const openState = useStatefulOpenState<{ observationIndex: number }>();

  if (!file.text_mapping) {
    return (
      <div className="shimmer whitespace-pre-wrap leading-5 tracking-wide">
        {file.user_provided_text}
      </div>
    );
  }

  const textBlocks = getTextBlocks(file.text_mapping, file.user_provided_text);
  const groupMap = getGroupMap(file.processed_annotations ?? []);

  return (
    <>
      <DetailDialog openState={openState} selectedFileName={file.name} />
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
              return <span key={`${file.name} ${id}`}>{textSnippet}</span>;

            const isHovered = group.observationGroup.includes(
              currentHoveredWordIndex ?? -1,
            );

            return (
              <button
                key={`${file.name} ${id}`}
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
                  openState.open({ observationIndex: group.observationIndex })
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
