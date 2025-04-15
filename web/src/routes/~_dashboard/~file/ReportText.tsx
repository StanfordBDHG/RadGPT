//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Button, Card } from "@stanfordspezi/spezi-web-design-system";
import { ErrorState } from "@stanfordspezi/spezi-web-design-system/components/ErrorState";
import {
  PopoverRoot,
  PopoverTrigger,
} from "@stanfordspezi/spezi-web-design-system/components/Popover";
import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { useStatefulOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { RotateCw } from "lucide-react";
import { type ComponentProps, type ReactNode, useMemo, useState } from "react";
import {
  AnnotationProcessingError,
  getGroupMap,
} from "@/modules/files/processedAnnotations";
import { type FileDetails } from "@/modules/files/queries";
import { getTextBlocks } from "@/modules/files/textMapping";
import { callables } from "@/modules/firebase/app";
import { DetailContent } from "./DetailContent";
import { DetailPopoverContent } from "./DetailPopover";

interface ReportTextProp {
  file: FileDetails;
}

const errorCodeToMessageComponent = (
  fileName: string,
): Record<AnnotationProcessingError, ReactNode> => ({
  [AnnotationProcessingError.validationFailed]:
    "This report could not be identified as a radiology report. In case you believe this is a mistake, please send a brief email to ...",
  [AnnotationProcessingError.uploadLimitReached]:
    "You have reached your limit for radiology report uploads. In case you believe this is a mistake or if you want to file for an exemption, please send a brief email to ...",
  [AnnotationProcessingError.timeout]: (
    <div className="flex flex-col">
      An unknown error occurred. Please try again later.
      <Button
        className="mx-auto mt-2"
        variant="secondary"
        size="xs"
        onClick={() => {
          void callables.onAnnotateFileRetrigger({
            file_name: fileName,
          });
        }}
      >
        Retry
        <RotateCw className="w-4" />
      </Button>
    </div>
  ),
});

const TextContainer = ({ className, ...props }: ComponentProps<"div">) => (
  <Card
    className={cn("p-5 leading-5 tracking-wide whitespace-pre-wrap", className)}
    {...props}
  />
);

export interface DetailOpenState {
  observationIndex: number;
  key: number | null;
}

export const ReportText = ({ file }: ReportTextProp) => {
  const [currentHoveredWordIndex, setCurrentHoveredWordIndex] = useState<
    number | null
  >(null);
  const openState = useStatefulOpenState<DetailOpenState>();

  const textMapping = useMemo(() => {
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
          <ErrorState>
            {errorCodeToMessageComponent(file.name)[file.error_code]}
          </ErrorState>
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

  if (!textMapping) {
    throw new Error("Invalid state in ReportText.");
  }

  const { textBlocks, groupMap } = textMapping;

  return (
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
            currentHoveredWordIndex ??
              (openState.isOpen ? openState.state?.key : null) ??
              -1,
          );

          return (
            <PopoverRoot
              key={`${file.name} ${id}`}
              open={openState.isOpen && openState.state?.key === key}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  openState.close();
                  setCurrentHoveredWordIndex(null);
                }
              }}
            >
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "focus-ring transition-all",
                    isHovered ?
                      [
                        position,
                        group.isLocatedAt ? "bg-yellow-300" : "bg-green-300",
                      ]
                    : "text-blue-700 underline underline-offset-2",
                  )}
                  onMouseEnter={() => setCurrentHoveredWordIndex(key)}
                  onMouseLeave={() => setCurrentHoveredWordIndex(null)}
                  onFocus={() => setCurrentHoveredWordIndex(key)}
                  onClick={() =>
                    openState.open({
                      observationIndex: group.observationIndex,
                      key,
                    })
                  }
                >
                  {textSnippet}
                </button>
              </PopoverTrigger>
              <DetailPopoverContent>
                <DetailContent
                  openState={openState}
                  selectedFileName={file.name}
                />
              </DetailPopoverContent>
            </PopoverRoot>
          );
        },
      )}
    </TextContainer>
  );
};
