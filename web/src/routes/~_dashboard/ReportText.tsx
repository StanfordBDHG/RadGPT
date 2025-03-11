//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { useOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { httpsCallable, type HttpsCallable } from "firebase/functions";
import { useState } from "react";
import { functions } from "@/utils/firebase";
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

interface DetailedResponse {
  main_explanation: string;

  concept_question_1: string | null;
  concept_answer_1: string | null;

  concept_question_2: string | null;
  concept_answer_2: string | null;
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
  const openState = useOpenState(false);
  const [mainExplanation, setMainExplanation] = useState<null | string>(null);
  const [conceptQuestion1, setQuestion1] = useState<null | string>(null);
  const [conceptAnswer1, setAnswer1] = useState<null | string>(null);
  const [conceptQuestion2, setQuestion2] = useState<null | string>(null);
  const [conceptAnswer2, setAnswer2] = useState<null | string>(null);
  const [selectedNumber, setSelectedNumber] = useState<null | number>(null);
  const [selectedObservationNumber, setSelectedObservationNumber] = useState<
    null | number
  >(null);

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
        answer={mainExplanation}
        openState={openState}
        conceptQuestion1={conceptQuestion1}
        conceptAnswer1={conceptAnswer1}
        conceptQuestion2={conceptQuestion2}
        conceptAnswer2={conceptAnswer2}
        selectedNumber={selectedNumber}
        setSelectedNumber={setSelectedNumber}
        selectedFileName={`${selectedFileName}/cached_answer_${selectedObservationNumber}`}
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
                onClick={async () => {
                  setMainExplanation(null);
                  setQuestion1(null);
                  setAnswer1(null);
                  setQuestion2(null);
                  setAnswer2(null);
                  setSelectedNumber(null);
                  openState.open();
                  const gptAnswer: HttpsCallable<
                    { file_name: string; observation_id: number },
                    DetailedResponse
                  > = httpsCallable(
                    functions,
                    "on_detailed_explanation_request",
                  );
                  const r = await gptAnswer({
                    file_name: selectedFileName,
                    observation_id: group.observationId,
                  });
                  setMainExplanation(r.data.main_explanation);
                  setQuestion1(r.data.concept_question_1);
                  setAnswer1(r.data.concept_answer_1);
                  setQuestion2(r.data.concept_question_2);
                  setAnswer2(r.data.concept_answer_2);
                  setSelectedObservationNumber(group.observationId);
                }}
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
