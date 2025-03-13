//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { Input } from "@stanfordspezi/spezi-web-design-system/components/Input";
import { toast } from "@stanfordspezi/spezi-web-design-system/components/Toaster";
import { Field, useForm } from "@stanfordspezi/spezi-web-design-system/forms";
import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { ChevronDown, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useRef, useState, type MouseEventHandler } from "react";
import { z } from "zod";

interface QuestionAnswerProps {
  isSelected: boolean;
  question: string;
  answer: string;
  onClick: MouseEventHandler;
  like: boolean | null;
  dislike: boolean | null;
  onLike: MouseEventHandler;
  onDislike: MouseEventHandler;
  onFeedbackSubmit: (feedback: string) => Promise<void>;
  textFeedback: string | null;
}

const formSchema = z.object({
  feedback: z.string(),
});

export const QuestionAnswer = ({
  isSelected,
  question,
  answer,
  onClick,
  like,
  dislike,
  onLike,
  onDislike,
  onFeedbackSubmit,
  textFeedback,
}: QuestionAnswerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const form = useForm({
    formSchema,
    defaultValues: {
      feedback: textFeedback ?? "",
    },
  });

  useEffect(() => {
    const heightString = !isSelected ? 0 : (ref.current?.scrollHeight ?? 0);
    setHeight(heightString);
  }, [isSelected]);

  const handleSubmit = form.handleSubmit(async ({ feedback }) => {
    try {
      await onFeedbackSubmit(feedback);
      toast.success("The feedback has been submitted, thank you!");
    } catch {
      toast.error("An error occurred while submitting the feedback!");
    }
  });

  return (
    <>
      <button
        data-testid="question"
        onClick={onClick}
        className="interactive-opacity flex flex-row text-left"
      >
        {question}
        <ChevronDown
          className={cn(
            "ml-auto min-w-8 transition",
            isSelected && "rotate-180",
          )}
        />
      </button>
      <div
        ref={ref}
        style={{ height }}
        className="overflow-hidden border-b border-slate-200 duration-200"
      >
        <div className="text-md text-gray-700">
          {answer}
          <div className="mt-2 flex flex-row items-center pb-2">
            <button
              aria-label="Like answer"
              className="focus-ring"
              onClick={onLike}
            >
              <ThumbsUp
                className={cn(
                  "h-6 transition",
                  like ? "text-green-700" : (
                    "text-gray-300 hover:text-green-700"
                  ),
                )}
              />
            </button>
            <button
              onClick={onDislike}
              aria-label="Dislike answer"
              className="focus-ring"
            >
              <ThumbsDown
                className={cn(
                  "h-6 transition",
                  dislike ? "text-red-700" : "text-gray-300 hover:text-red-700",
                )}
              />
            </button>
            <form
              className="ml-2 flex w-full flex-row items-center"
              onSubmit={handleSubmit}
            >
              <Field
                control={form.control}
                name="feedback"
                className="w-full"
                checkEmptyError
                render={({ field }) => (
                  <Input placeholder="Feedback" {...field} />
                )}
              />
              <Button
                type="submit"
                className="ml-3"
                isPending={form.formState.isSubmitting}
              >
                Submit
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
