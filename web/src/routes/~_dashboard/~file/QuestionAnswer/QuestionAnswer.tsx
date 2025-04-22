//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { ChevronDown } from "lucide-react";
import { type MouseEventHandler } from "react";
import { DislikeButton, LikeButton } from "./FeedbackButtons";
import { UserFeedbackOrigin } from "../FeedbackDialog/MultiCheckboxFeedbackDialog";
import { UserIssueDialog } from "../FeedbackDialog/UserIssueDialog";
import { UserPositiveFeedbackDialog } from "../FeedbackDialog/UserPositiveFeedbackDialog";

interface QuestionAnswerProps {
  isSelected: boolean;
  question: string;
  answer: string;
  onClick: MouseEventHandler;
  like: boolean | null;
  dislike: boolean | null;
  onLike: MouseEventHandler;
  onDislike: MouseEventHandler;
  reportID: string;
  observationIndex: number | undefined;
  questionIndex: number;
}

export const QuestionAnswer = ({
  isSelected,
  question,
  answer,
  onClick,
  like,
  dislike,
  onLike,
  onDislike,
  reportID,
  observationIndex,
  questionIndex,
}: QuestionAnswerProps) => (
  <div className="mb-3 flex flex-col border-b last:mb-0 last:border-b-0">
    <button
      data-testid="question"
      onClick={onClick}
      className="interactive-opacity mb-3 flex flex-row text-left text-gray-600"
    >
      {question}
      <ChevronDown
        className={cn(
          "text-muted-foreground ml-auto min-w-8 transition",
          isSelected && "rotate-180",
        )}
      />
    </button>
    <div
      className={cn(
        "grid transition-all",
        isSelected ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
      aria-hidden={!isSelected}
    >
      <div className="overflow-hidden">
        <span className="text-gray-600">{answer}</span>
        <div className="mt-4 flex flex-row items-center gap-2 pb-6">
          <UserPositiveFeedbackDialog
            context={{
              report_id: reportID,
              origin: UserFeedbackOrigin.QuestionAnswerLevel,
              question_index: questionIndex,
              observation_index: observationIndex,
            }}
          >
            <LikeButton
              onClick={onLike}
              like={like}
              data-testid="question-like"
            />
          </UserPositiveFeedbackDialog>
          <UserIssueDialog
            context={{
              report_id: reportID,
              origin: UserFeedbackOrigin.QuestionAnswerLevel,
              question_index: questionIndex,
              observation_index: observationIndex,
            }}
          >
            <DislikeButton
              onClick={onDislike}
              dislike={dislike}
              data-testid="question-dislike"
            />
          </UserIssueDialog>
        </div>
      </div>
    </div>
  </div>
);
