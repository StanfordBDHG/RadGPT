//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import {
  Async,
  queriesToAsyncProps,
} from "@stanfordspezi/spezi-web-design-system/components/Async";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@stanfordspezi/spezi-web-design-system/components/Dialog";
import { type useStatefulOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { useQuery } from "@tanstack/react-query";
import { type Dispatch, type SetStateAction } from "react";
import { QuestionAnswer } from "@/routes/~_dashboard/QuestionAnswer";
import { filesQueries } from "@/modules/files/queries";

interface DetailDialogProps {
  openState: ReturnType<
    typeof useStatefulOpenState<{ observationIndex: number }>
  >;
  selectedNumber: number | undefined;
  setSelectedNumber: Dispatch<SetStateAction<number | undefined>>;
  selectedFileName: string;
}

export const DetailDialog = ({
  openState,
  selectedNumber,
  setSelectedNumber,
  selectedFileName,
}: DetailDialogProps) => {
  const detailedExplanationQuery = useQuery(
    filesQueries.getDetailedExplanation(
      openState.state ?
        {
          observation_id: openState.state.observationIndex,
          file_name: selectedFileName,
        }
      : null,
    ),
  );
  const feedbackQuery = useQuery(
    filesQueries.getObservationFeedback(
      openState.state ?
        {
          observationIndex: openState.state.observationIndex,
          fileName: selectedFileName,
        }
      : null,
    ),
  );
  const {
    main_explanation,
    concept_based_question_answer,
    concept_based_template_question,
    concept_based_template_question_answer,
    concept_based_question,
  } = detailedExplanationQuery.data?.data ?? {};

  const { like1, dislike1, textFeedback1, like2, dislike2, textFeedback2 } =
    feedback?.feedback ?? {
      like1: false,
      dislike1: false,
      textFeedback1: "",
      like2: false,
      dislike2: false,
      textFeedback2: "",
    };

  return (
    <Dialog open={openState.isOpen} onOpenChange={openState.close}>
      <DialogContent className="max-h-screen min-w-[50%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detailed Explanation</DialogTitle>
          <Async
            {...queriesToAsyncProps([detailedExplanationQuery, feedbackQuery])}
          >
            <p>{main_explanation}</p>
            {concept_based_question && concept_based_question_answer && (
              <h3 className="text-lg font-semibold">
                Other questions you may have
              </h3>
            )}
            {concept_based_question && concept_based_question_answer && (
              <QuestionAnswer
                onClick={() =>
                  selectedNumber === 1 ?
                    setSelectedNumber(undefined)
                  : setSelectedNumber(1)
                }
                isSelected={selectedNumber === 1}
                question={concept_based_question}
                answer={concept_based_question_answer}
                onLike={createOnLike(1)}
                onDislike={createOnDislike(1)}
                like={like1}
                dislike={dislike1}
                textFeedback={textFeedback1}
                onFeedbackSubmit={createOnFeedback(1)}
              />
            )}
            {concept_based_template_question &&
              concept_based_template_question_answer && (
                <QuestionAnswer
                  onClick={() =>
                    selectedNumber === 2 ?
                      setSelectedNumber(undefined)
                    : setSelectedNumber(2)
                  }
                  isSelected={selectedNumber === 2}
                  question={concept_based_template_question}
                  answer={concept_based_template_question_answer}
                  onLike={createOnLike(2)}
                  onDislike={createOnDislike(2)}
                  like={like2}
                  dislike={dislike2}
                  textFeedback={textFeedback2}
                  onFeedbackSubmit={createOnFeedback(2)}
                />
              )}
          </Async>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
