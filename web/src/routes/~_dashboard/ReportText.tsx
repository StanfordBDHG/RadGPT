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
import {
  getTextBlocks,
  TextBlockPosition,
  TextMapping,
} from "@/src/utils/textMapping";
import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { functions } from "@/src/utils/firebase";
import { useOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { httpsCallable, HttpsCallable } from "firebase/functions";
import { useState } from "react";
import DetailDialog from "./DetailDialog";

interface ReportTextProp {
  userProvidedText: string;
  selectedFileName: string;
  textMapping: TextMapping | null;
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
  const openState = useOpenState(false);
  const [answer, setAnswer] = useState<null | string>(null);

  if (!textMapping) {
    return (
      <div className="shimmer whitespace-pre-wrap tracking-wide leading-5">
        {userProvidedText}
      </div>
    );
  }

  const textBlocks = getTextBlocks(textMapping, userProvidedText);
  const groupMap = getGroupMap(processedAnnotations);

  if (textBlocks.length === 0) {
    textBlocks.push([null, "Loading...", 0, TextBlockPosition.STAND_ALONE]);
  }

  return (
    <>
      <DetailDialog answer={answer} openState={openState} />
      <div className="whitespace-pre-wrap tracking-wide leading-5">
        {textBlocks.map(([key, textSnippet, id, position]) => (
          <span
            key={`${selectedFileName} ${id}`}
            className={cn(
              currentHoveredWordIndex &&
                key &&
                (groupMap.get(key)?.["observationGroup"] ?? []).includes(currentHoveredWordIndex)
                ? `bg-green-300 transition-color cursor-pointer keyword-highlight${position}`
                : "",
              key &&
                !(groupMap.get(key)?.["observationGroup"] ?? []).includes(
                  currentHoveredWordIndex ?? -1,
                )
                ? "underline text-blue-700"
                : "",
            )}
            onMouseEnter={() => setCurrentHoveredWordIndex(key)}
            onMouseLeave={() => setCurrentHoveredWordIndex(null)}
            onClick={async () => {
              if (key === null) return;
              setAnswer(null);
              openState.open();
              const gptAnswer: HttpsCallable<
                { file_name: string; observation_id: number },
                string
              > = httpsCallable(functions, "on_detailed_explanation_request");
              const r = await gptAnswer({
                file_name: selectedFileName,
                observation_id: groupMap.get(+(key ?? -1))?.["observationId"] ?? -1
                // token_ids: groupMap.get(+(key ?? "-1")) ?? [],
              });
              setAnswer(r.data);
            }}
          >
            {textSnippet}
          </span>
        ))}
      </div>
    </>
  );
}
