//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { type DocumentReference } from "@firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@stanfordspezi/spezi-web-design-system/components/Dialog";
import { type useStatefulOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { callables, firestore } from "@/modules/firebase/app";
import { type OnDetailedExplanationRequestInput } from "@/modules/firebase/utils";
import { useAuthenticatedUser } from "@/modules/user";
import { QuestionAnswer } from "@/routes/~_dashboard/QuestionAnswer";

interface DetailDialogProps {
  openState: ReturnType<
    typeof useStatefulOpenState<{ observationIndex: number }>
  >;
  selectedNumber: number | undefined;
  setSelectedNumber: Dispatch<SetStateAction<number | undefined>>;
  selectedFileName: string;
}

interface Feedback {
  feedback: {
    like1: boolean | null;
    like2: boolean | null;
    dislike1: boolean | null;
    dislike2: boolean | null;
    textFeedback1: string | null;
    textFeedback2: string | null;
  };
}

const detailDialogQueries = {
  onDetailedExplanationRequest: (
    payload: OnDetailedExplanationRequestInput | null,
  ) =>
    queryOptions({
      queryKey: ["onDetailedExplanationRequest", payload],
      queryFn:
        payload ?
          () => callables.onDetailedExplanationRequest(payload)
        : skipToken,
    }),
};

export const DetailDialog = ({
  openState,
  selectedNumber,
  setSelectedNumber,
  selectedFileName,
}: DetailDialogProps) => {
  const currentUser = useAuthenticatedUser();

  const detailedExplanationRequestQuery = useQuery(
    detailDialogQueries.onDetailedExplanationRequest(
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
    concept_based_question_answer = "",
    concept_based_template_question = "",
    concept_based_template_question_answer = "",
    concept_based_question = "",
  } = detailedExplanationRequestQuery.data?.data ?? {};

  const cachedFileName = `${selectedFileName}/cached_answer_${openState.state?.observationIndex}`;

  const [feedback, setFeedback] = useState<Feedback>();

  const { like1, dislike1, textFeedback1, like2, dislike2, textFeedback2 } =
    feedback?.feedback ?? {
      like1: false,
      dislike1: false,
      textFeedback1: "",
      like2: false,
      dislike2: false,
      textFeedback2: "",
    };

  const feedbackRef = doc(
    firestore,
    `users/${currentUser?.uid}/${cachedFileName}`,
  ) as DocumentReference<Feedback, Feedback>;

  useEffect(() => {
    let ignore = false;

    const unsubscribe = onSnapshot(feedbackRef, (documentSnapshot) => {
      if (ignore) return;
      setFeedback(documentSnapshot.data());
    });
    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [currentUser, feedbackRef]);

  const createOnLike = (id: number) => () =>
    updateDoc(feedbackRef, {
      feedback: {
        like1: (like1 && id !== 1) || (!like1 && id === 1),
        dislike1: !((like1 && id !== 1) || (!like1 && id === 1)) && dislike1,
        textFeedback1: textFeedback1,
        like2: (like2 && id !== 2) || (!like2 && id === 2),
        dislike2: !((like2 && id !== 2) || (!like2 && id === 2)) && dislike2,
        textFeedback2: textFeedback2,
      },
    });
  const createOnDislike = (id: number) => () =>
    updateDoc(feedbackRef, {
      feedback: {
        dislike1: (dislike1 && id !== 1) || (!dislike1 && id === 1),
        like1: !((dislike1 && id !== 1) || (!dislike1 && id === 1)) && like1,
        textFeedback1: textFeedback1,
        dislike2: (dislike2 && id !== 2) || (!dislike2 && id === 2),
        like2: !((dislike2 && id !== 2) || (!dislike2 && id === 2)) && like2,
        textFeedback2: textFeedback2,
      },
    });
  const createOnFeedback = (id: number) => async (feedback: string) =>
    updateDoc(feedbackRef, {
      feedback: {
        dislike1: dislike1,
        like1: like1,
        textFeedback1: id === 1 ? feedback : textFeedback1,
        dislike2: dislike2,
        like2: like2,
        textFeedback2: id === 2 ? feedback : textFeedback2,
      },
    });

  return (
    <Dialog open={openState.isOpen} onOpenChange={openState.close}>
      <DialogContent className="max-h-screen min-w-[50%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detailed Explanation</DialogTitle>
          {main_explanation ?
            <p>{main_explanation}</p>
          : <Loader2 className="mt-2 animate-spin" />}
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
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
