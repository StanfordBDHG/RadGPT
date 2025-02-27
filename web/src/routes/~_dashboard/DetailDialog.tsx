//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { type DocumentReference } from "@firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@stanfordspezi/spezi-web-design-system/components/Dialog";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { firestore } from "@/utils/firebase";
import { QuestionAnswer } from "./QuestionAnswer";

interface DetailDialogProps {
  answer: string | null;
  openState: {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    close: () => void;
    open: () => void;
    toggle: () => void;
  };
  conceptBasedQuestion: string | null;
  conceptBasedQuestionAnswer: string | null;
  conceptBasedTemplateQuestion: string | null;
  conceptBasedTemplateQuestionAnswer: string | null;
  selectedNumber: number | null;
  setSelectedNumber: Dispatch<SetStateAction<number | null>>;
  selectedFileName: string;
}

export function DetailDialog({
  answer,
  openState,
  conceptBasedQuestion: concept_based_question,
  conceptBasedQuestionAnswer: concept_based_question_answer,
  conceptBasedTemplateQuestion: concept_based_template_question,
  conceptBasedTemplateQuestionAnswer: concept_based_template_question_answer,
  selectedNumber,
  setSelectedNumber,
  selectedFileName,
}: DetailDialogProps) {
  const currentUser = useAuthenticatedUser();

  const [like1, setLike1] = useState(false);
  const [dislike1, setDislike1] = useState(false);
  const [textFeedback1, setTextFeedback1] = useState("");
  const [like2, setLike2] = useState(false);
  const [dislike2, setDislike2] = useState(false);
  const [textFeedback2, setTextFeedback2] = useState("");

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

  const feedbackRef = doc(
    firestore,
    `users/${currentUser?.uid}/${selectedFileName}`,
  ) as DocumentReference<Feedback, Feedback>;

  useEffect(() => {
    if (currentUser === null) {
      return;
    }
    let ignore = false;

    const unsubscribe = onSnapshot(feedbackRef, (documentSnapshot) => {
      if (ignore) {
        return;
      }
      const data = documentSnapshot.data()?.feedback;
      setLike1(data?.like1 ?? false);
      setLike2(data?.like2 ?? false);
      setDislike1(data?.dislike1 ?? false);
      setDislike2(data?.dislike2 ?? false);
      setTextFeedback1(data?.textFeedback1 ?? "");
      setTextFeedback2(data?.textFeedback2 ?? "");
    });
    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [currentUser, feedbackRef]);

  const onLikeFunctor = (id: number) => () =>
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
  const onDislikeFunctor = (id: number) => () =>
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
  const onFeedbackFunctor = (id: number) => async (feedback: string) =>
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
    <Dialog open={openState.isOpen} onOpenChange={openState.setIsOpen}>
      <DialogContent className="max-h-screen min-w-[50%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detailed Explanation</DialogTitle>
          {answer !== null ?
            <p>{answer}</p>
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
                  setSelectedNumber(null)
                : setSelectedNumber(1)
              }
              isSelected={selectedNumber === 1}
              question={concept_based_question}
              answer={concept_based_question_answer}
              onLike={onLikeFunctor(1)}
              onDislike={onDislikeFunctor(1)}
              like={like1}
              dislike={dislike1}
              textFeedback={textFeedback1}
              onFeedbackSubmit={onFeedbackFunctor(1)}
            />
          )}
          {concept_based_template_question &&
            concept_based_template_question_answer && (
              <QuestionAnswer
                onClick={() =>
                  selectedNumber === 2 ?
                    setSelectedNumber(null)
                  : setSelectedNumber(2)
                }
                isSelected={selectedNumber === 2}
                question={concept_based_template_question}
                answer={concept_based_template_question_answer}
                onLike={onLikeFunctor(2)}
                onDislike={onDislikeFunctor(2)}
                like={like2}
                dislike={dislike2}
                textFeedback={textFeedback2}
                onFeedbackSubmit={onFeedbackFunctor(2)}
              />
            )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
