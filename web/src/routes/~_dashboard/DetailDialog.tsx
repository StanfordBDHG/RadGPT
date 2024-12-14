//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@stanfordspezi/spezi-web-design-system/components/Dialog";
import QuestionAnswer from "./QuestionAnswer";
import { Loader2 } from "lucide-react";

export default function DetailDialog({
  answer,
  openState,
  conceptBasedQuestion: concept_based_question,
  conceptBasedQuestionAnswer: concept_based_question_answer,
  conceptBasedTemplateQuestion: concept_based_template_question,
  conceptBasedTemplateQuestionAnswer: concept_based_template_question_answer,
  selectedNumber,
  setSelectedNumber,
}: {
  answer: string | null;
  openState: {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    close: () => void;
    open: () => void;
    toggle: () => void;
  };
  conceptBasedQuestion: string | null;
  conceptBasedQuestionAnswer: string | null;
  conceptBasedTemplateQuestion: string | null;
  conceptBasedTemplateQuestionAnswer: string | null;
  selectedNumber: number | null;
  setSelectedNumber: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  return (
    <Dialog open={openState.isOpen} onOpenChange={openState.setIsOpen}>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[50%]">
        <DialogHeader>
          <DialogTitle>Detailed Explanation</DialogTitle>
          {answer !== null ? (
            <p>{answer}</p>
          ) : (
            <Loader2 className="mt-2 animate-spin" />
          )}
          {concept_based_question && concept_based_question_answer && (
            <h3 className="text-lg font-semibold">
              Other questions you may have
            </h3>
          )}
          {concept_based_question && concept_based_question_answer && (
            <QuestionAnswer
              onClick={() =>
                selectedNumber === 1
                  ? setSelectedNumber(null)
                  : setSelectedNumber(1)
              }
              isSelected={selectedNumber === 1}
              question={concept_based_question}
              answer={concept_based_question_answer}
            />
          )}
          {concept_based_template_question &&
            concept_based_template_question_answer && (
              <QuestionAnswer
                onClick={() =>
                  selectedNumber === 2
                    ? setSelectedNumber(null)
                    : setSelectedNumber(2)
                }
                isSelected={selectedNumber === 2}
                question={concept_based_template_question}
                answer={concept_based_template_question_answer}
              />
            )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
