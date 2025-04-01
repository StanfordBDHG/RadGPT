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
import { type useStatefulOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { useQuery } from "@tanstack/react-query";
import { updateDoc } from "firebase/firestore";
import { useState } from "react";
import { filesQueries } from "@/modules/files/queries";
import { docRefs, getCurrentUser } from "@/modules/firebase/app";
import { queryClient } from "@/modules/query/queryClient";
import { UserFeedbackOrigin } from "./FeedbackDialog/MultiCheckboxFeedbackDialog";
import { UserIssueDialog } from "./FeedbackDialog/UserIssueDialog";
import { UserPositiveFeedbackDialog } from "./FeedbackDialog/UserPositiveFeedbackDialog";
import { DislikeButton, LikeButton } from "./QuestionAnswer/FeedbackButtons";
import { QuestionAnswer } from "./QuestionAnswer/QuestionAnswer";
import type { DetailOpenState } from "./ReportText";

interface DetailContentProps {
  openState: ReturnType<typeof useStatefulOpenState<DetailOpenState>>;
  selectedFileName: string;
}

export const DetailContent = ({
  openState,
  selectedFileName,
}: DetailContentProps) => {
  const [selectedNumber, setSelectedNumber] = useState<number>();

  const detailedExplanationQuery = useQuery(
    filesQueries.getDetailedExplanation(
      openState.state ?
        {
          observation_index: openState.state.observationIndex,
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

  const {
    like_explanation,
    dislike_explanation,
    like_question_1,
    dislike_question_1,
    like_question_2,
    dislike_question_2,
  } = feedbackQuery.data?.feedback ?? {
    like_explanation: false,
    dislike_explanation: false,
    like_question_1: false,
    dislike_question_1: false,
    like_question_2: false,
    dislike_question_2: false,
  };
  const feedbackRef =
    feedbackPayload ? docRefs.feedback(feedbackPayload) : null;

  const invalidateFeedbackQuery = () =>
    queryClient.invalidateQueries(feedbackQueryOption);

  const createOnLike = (index: number) => async () => {
    if (!feedbackRef) return;
    await updateDoc(feedbackRef, {
      feedback: {
        like_explanation: like_explanation,
        dislike_explanation: dislike_explanation,
        like_question_1:
          (like_question_1 && index !== 1) || (!like_question_1 && index === 1),
        dislike_question_1:
          !(
            (like_question_1 && index !== 1) ||
            (!like_question_1 && index === 1)
          ) && dislike_question_1,
        like_question_2:
          (like_question_2 && index !== 2) || (!like_question_2 && index === 2),
        dislike_question_2:
          !(
            (like_question_2 && index !== 2) ||
            (!like_question_2 && index === 2)
          ) && dislike_question_2,
      },
    });
    await invalidateFeedbackQuery();
  };

  const createOnDislike = (id: number) => async () => {
    if (!feedbackRef) return;
    await updateDoc(feedbackRef, {
      feedback: {
        dislike_explanation: dislike_explanation,
        like_explanation: like_explanation,
        dislike_question_1:
          (dislike_question_1 && id !== 1) || (!dislike_question_1 && id === 1),
        like_question_1:
          !(
            (dislike_question_1 && id !== 1) ||
            (!dislike_question_1 && id === 1)
          ) && like_question_1,
        dislike_question_2:
          (dislike_question_2 && id !== 2) || (!dislike_question_2 && id === 2),
        like_question_2:
          !(
            (dislike_question_2 && id !== 2) ||
            (!dislike_question_2 && id === 2)
          ) && like_question_2,
      },
    });
    await invalidateFeedbackQuery();
  };

  const observationIndex = openState.state?.observationIndex;

  const onLike = async () => {
    if (!feedbackRef) return;
    await updateDoc(feedbackRef, {
      feedback: {
        dislike_explanation: false,
        like_explanation: true,
        dislike_question_1: dislike_question_1,
        like_question_1: like_question_1,
        dislike_question_2: dislike_question_2,
        like_question_2: like_question_2,
      },
    });
    await invalidateFeedbackQuery();
  };
  const onDislike = async () => {
    if (!feedbackRef) return;
    await updateDoc(feedbackRef, {
      feedback: {
        dislike_explanation: true,
        like_explanation: false,
        dislike_question_1: dislike_question_1,
        like_question_1: like_question_1,
        dislike_question_2: dislike_question_2,
        like_question_2: like_question_2,
      },
    });
    await invalidateFeedbackQuery();
  };

  return (
    <Async {...queriesToAsyncProps([detailedExplanationQuery, feedbackQuery])}>
      <p>{main_explanation}</p>
      <div className="flex flex-row items-center gap-2 pb-6">
        <UserPositiveFeedbackDialog
          context={{
            report_id: selectedFileName,
            origin: UserFeedbackOrigin.ExplanationLevel,
            observation_index: observationIndex,
          }}
        >
          <LikeButton
            onClick={onLike}
            like={like_explanation}
            data-testid="explanation-like"
          />
        </UserPositiveFeedbackDialog>
        <UserIssueDialog
          context={{
            report_id: selectedFileName,
            origin: UserFeedbackOrigin.ExplanationLevel,
            observation_index: observationIndex,
          }}
        >
          <DislikeButton
            onClick={onDislike}
            dislike={dislike_explanation}
            data-testid="explanation-dislike"
          />
        </UserIssueDialog>
      </div>
      {concept_question_1 && concept_answer_1 && (
        <h3 className="font-medium">Other questions you may have</h3>
      )}
      <div className="flex flex-col">
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
            like={like_question_1}
            dislike={dislike_question_1}
            reportID={selectedFileName}
            observationIndex={observationIndex}
            questionIndex={1}
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
            like={like_question_2}
            dislike={dislike_question_2}
            reportID={selectedFileName}
            observationIndex={observationIndex}
            questionIndex={2}
          />
        )}
      </div>
    </Async>
  );
};
