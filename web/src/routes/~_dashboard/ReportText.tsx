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
import { functions } from "@/modules/firebase/app";
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

  concept_based_question: string | null;
  concept_based_question_answer: string | null;

  concept_based_template_question: string | null;
  concept_based_template_question_answer: string | null;
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
  const [conceptBasedQuestion, setConceptBasedQuestion] = useState<
    null | string
  >(null);
  const [conceptBasedQuestionAnswer, setConceptBasedQuestionAnswer] = useState<
    null | string
  >(null);
  const [conceptBasedTemplateQuestion, setConceptBasedTemplateQuestion] =
    useState<null | string>(null);
  const [
    conceptBasedTemplateQuestionAnswer,
    setConceptBasedTemplateQuestionAnswer,
  ] = useState<null | string>(null);
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
        conceptBasedQuestion={conceptBasedQuestion}
        conceptBasedQuestionAnswer={conceptBasedQuestionAnswer}
        conceptBasedTemplateQuestion={conceptBasedTemplateQuestion}
        conceptBasedTemplateQuestionAnswer={conceptBasedTemplateQuestionAnswer}
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
                  setConceptBasedQuestion(null);
                  setConceptBasedTemplateQuestion(null);
                  setConceptBasedQuestionAnswer(null);
                  setConceptBasedTemplateQuestionAnswer(null);
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
                  setConceptBasedQuestion(r.data.concept_based_question);
                  setConceptBasedTemplateQuestion(
                    r.data.concept_based_template_question,
                  );
                  setConceptBasedQuestionAnswer(
                    r.data.concept_based_question_answer,
                  );
                  setConceptBasedTemplateQuestionAnswer(
                    r.data.concept_based_template_question_answer,
                  );
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
