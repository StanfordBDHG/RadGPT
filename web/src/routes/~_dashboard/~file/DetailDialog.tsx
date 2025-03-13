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
import { updateDoc } from "firebase/firestore";
import { useState } from "react";
import { filesQueries } from "@/modules/files/queries";
import { docRefs, getCurrentUser } from "@/modules/firebase/app";
import { queryClient } from "@/modules/query/queryClient";
import { QuestionAnswer } from "@/routes/~_dashboard/QuestionAnswer";

interface DetailDialogProps {
  openState: ReturnType<
    typeof useStatefulOpenState<{ observationIndex: number }>
  >;
  selectedFileName: string;
}

export const DetailDialog = ({
  openState,
  selectedFileName,
}: DetailDialogProps) => {
  const [selectedNumber, setSelectedNumber] = useState<number>();

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
  const {
    main_explanation,
    concept_question_1,
    concept_answer_1,
    concept_question_2,
    concept_answer_2,
  } = detailedExplanationQuery.data?.data ?? {};

  const feedbackPayload =
    openState.state ?
      {
        userId: getCurrentUser().uid,
        observationIndex: openState.state.observationIndex,
        fileName: selectedFileName,
      }
    : null;
  const feedbackQueryOption =
    filesQueries.getObservationFeedback(feedbackPayload);
  const feedbackQuery = useQuery(feedbackQueryOption);
  const { like1, dislike1, textFeedback1, like2, dislike2, textFeedback2 } =
    feedbackQuery.data?.feedback ?? {
      like1: false,
      dislike1: false,
      textFeedback1: "",
      like2: false,
      dislike2: false,
      textFeedback2: "",
    };
  const feedbackRef =
    feedbackPayload ? docRefs.feedback(feedbackPayload) : null;

  const invalidateFeedbackQuery = () =>
    queryClient.invalidateQueries(feedbackQueryOption);

  const createOnLike = (id: number) => async () => {
    if (!feedbackRef) return;
    await updateDoc(feedbackRef, {
      feedback: {
        like1: (like1 && id !== 1) || (!like1 && id === 1),
        dislike1: !((like1 && id !== 1) || (!like1 && id === 1)) && dislike1,
        textFeedback1: textFeedback1,
        like2: (like2 && id !== 2) || (!like2 && id === 2),
        dislike2: !((like2 && id !== 2) || (!like2 && id === 2)) && dislike2,
        textFeedback2: textFeedback2,
      },
    });
    await invalidateFeedbackQuery();
  };

  const createOnDislike = (id: number) => async () => {
    if (!feedbackRef) return;
    await updateDoc(feedbackRef, {
      feedback: {
        dislike1: (dislike1 && id !== 1) || (!dislike1 && id === 1),
        like1: !((dislike1 && id !== 1) || (!dislike1 && id === 1)) && like1,
        textFeedback1: textFeedback1,
        dislike2: (dislike2 && id !== 2) || (!dislike2 && id === 2),
        like2: !((dislike2 && id !== 2) || (!dislike2 && id === 2)) && like2,
        textFeedback2: textFeedback2,
      },
    });
    await invalidateFeedbackQuery();
  };

  const createOnFeedback = (id: number) => async (feedback: string) => {
    if (!feedbackRef) return;
    await updateDoc(feedbackRef, {
      feedback: {
        dislike1: dislike1,
        like1: like1,
        textFeedback1: id === 1 ? feedback : textFeedback1,
        dislike2: dislike2,
        like2: like2,
        textFeedback2: id === 2 ? feedback : textFeedback2,
      },
    });
    await invalidateFeedbackQuery();
  };

  return (
    <Dialog
      open={openState.isOpen}
      onOpenChange={openState.close}
      key={openState.state?.observationIndex}
    >
      <DialogContent className="max-h-screen min-w-[50%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detailed Explanation</DialogTitle>
          <Async
            {...queriesToAsyncProps([detailedExplanationQuery, feedbackQuery])}
          >
            <p>{main_explanation}</p>
            {concept_question_1 && concept_answer_1 && (
              <h3 className="text-lg font-semibold">
                Other questions you may have
              </h3>
            )}
            {concept_question_1 && concept_answer_1 && (
              <QuestionAnswer
                onClick={() =>
                  selectedNumber === 1 ?
                    setSelectedNumber(undefined)
                  : setSelectedNumber(1)
                }
                isSelected={selectedNumber === 1}
                question={concept_question_1}
                answer={concept_answer_1}
                onLike={createOnLike(1)}
                onDislike={createOnDislike(1)}
                like={like1}
                dislike={dislike1}
                textFeedback={textFeedback1}
                onFeedbackSubmit={createOnFeedback(1)}
              />
            )}
            {concept_question_2 && concept_answer_2 && (
              <QuestionAnswer
                onClick={() =>
                  selectedNumber === 2 ?
                    setSelectedNumber(undefined)
                  : setSelectedNumber(2)
                }
                isSelected={selectedNumber === 2}
                question={concept_question_2}
                answer={concept_answer_2}
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
