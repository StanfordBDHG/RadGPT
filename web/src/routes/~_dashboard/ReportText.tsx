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

type DetailedResponse = {
  main_explanation: string;

  concept_based_question: string | null;
  concept_based_question_answer: string | null;

  concept_based_template_question: string | null;
  concept_based_template_question_answer: string | null;
};

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
      <div className="shimmer whitespace-pre-wrap tracking-wide leading-5">
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
      <div className="whitespace-pre-wrap tracking-wide leading-5">
        {textBlocks.map(([key, textSnippet, id, position]) => (
          <span
            key={`${selectedFileName} ${id}`}
            className={cn(
              currentHoveredWordIndex &&
                key &&
                (groupMap.get(key)?.["observationGroup"] ?? []).includes(
                  currentHoveredWordIndex,
                )
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
              > = httpsCallable(functions, "on_detailed_explanation_request");
              const observationId =
                groupMap.get(+(key ?? -1))?.["observationId"] ?? -1;
              const r = await gptAnswer({
                file_name: selectedFileName,
                observation_id: observationId,
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
              setSelectedObservationNumber(observationId);
            }}
          >
            {textSnippet}
          </span>
        ))}
      </div>
    </>
  );
}
