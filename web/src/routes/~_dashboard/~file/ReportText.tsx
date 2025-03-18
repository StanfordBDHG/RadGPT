//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { useStatefulOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { ComponentProps, useMemo, useState } from "react";
import {
  AnnotationProcessingError,
  getGroupMap,
} from "@/modules/files/processedAnnotations";
import { type FileDetails } from "@/modules/files/queries";
import { getTextBlocks } from "@/modules/files/textMapping";
import { DetailDialog } from "@/routes/~_dashboard/~file/DetailDialog";
import { ErrorState } from "@stanfordspezi/spezi-web-design-system/components/ErrorState";

interface ReportTextProp {
  file: FileDetails;
}

const errorCodeToString: Record<AnnotationProcessingError, string> = {
  [AnnotationProcessingError.validationFailed]:
    "This report could not be identified as a radiology report. In case you believe this is a mistake, please send a brief email to ...",
  [AnnotationProcessingError.uploadLimitReached]:
    "You have reached your limit for radiology report uploads. In case you believe this is a mistake or if you want to file for an exemption, please send a brief email to ...",
};

const TextContainer = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn("whitespace-pre-wrap leading-5 tracking-wide", className)}
    {...props}
  />
);

export const ReportText = ({ file }: ReportTextProp) => {
  const [currentHoveredWordIndex, setCurrentHoveredWordIndex] = useState<
    number | null
  >(null);
  const openState = useStatefulOpenState<{ observationIndex: number }>();

  const memoTextMapping = useMemo(() => {
    if (file.error_code || !file.text_mapping) {
      return undefined;
    }

    const textBlocks = getTextBlocks(
      file.text_mapping,
      file.user_provided_text,
    );
    const groupMap = getGroupMap(file.processed_annotations ?? []);

    return { textBlocks, groupMap };
  }, [file]);

  if (file.error_code) {
    return (
      <div className="relative flex">
        <TextContainer>{file.user_provided_text}</TextContainer>
        <div className="flex-center absolute size-full bg-white/95">
          <ErrorState>{errorCodeToString[file.error_code]}</ErrorState>
        </div>
      </div>
    );
  }

  if (!file.text_mapping) {
    return (
      <TextContainer className="shimmer">
        {file.user_provided_text}
      </TextContainer>
    );
  }

  if (!memoTextMapping) {
    throw new Error("Invalid state in ReportText.");
  }

  const { textBlocks, groupMap } = memoTextMapping;

  return (
    <>
      <DetailDialog openState={openState} selectedFileName={file.name} />
      <TextContainer>
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
                onFocus={() => setCurrentHoveredWordIndex(key)}
                onClick={() =>
                  openState.open({ observationIndex: group.observationIndex })
                }
              >
                {textSnippet}
              </button>
            );
          },
        )}
      </TextContainer>
    </>
  );
};
