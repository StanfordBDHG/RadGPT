//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Input } from "@stanfordspezi/spezi-web-design-system/components/Input";
import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { toast } from "@stanfordspezi/spezi-web-design-system/components/Toaster";

export default function QuestionAnswer({
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
}: {
  isSelected: boolean;
  question: string;
  answer: string;
  onClick: React.MouseEventHandler<HTMLParagraphElement> | undefined;
  like: boolean;
  dislike: boolean;
  onLike: React.MouseEventHandler<SVGSVGElement>;
  onDislike: React.MouseEventHandler<SVGSVGElement>;
  onFeedbackSubmit: (feedback: string) => Promise<void>;
  textFeedback: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const heightString = !isSelected ? 0 : (ref.current?.scrollHeight ?? 0);
    setHeight(heightString);
  }, [isSelected]);

  if (feedbackRef.current !== null) {
    feedbackRef.current.value = textFeedback;
  }

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    setIsPending(true);

    // Source: https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forms_and_events/
    const target = formEvent.target as typeof formEvent.target & {
      textFeedback: { value: string | null } | null;
    };

    try {
      await onFeedbackSubmit(target?.textFeedback?.value ?? "");
      toast.success("The feedback has been submitted, thank you!");
    } catch {
      toast.error("An error occurred while submitting the feedback!");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div onClick={onClick} className={"cursor-pointer flex flex-row"}>
        {question}
        {isSelected ? (
          <ChevronUp className="min-w-[2rem] ml-auto" />
        ) : (
          <ChevronDown className="min-w-[2rem] ml-auto" />
        )}
      </div>
      <div
        ref={ref}
        style={{ height: height }}
        className={cn(
          "border-b border-slate-200 overflow-hidden transition-height duration-200",
        )}
      >
        <div className="text-md text-gray-700">
          {answer}
          <div className="flex flex-row pb-2 mt-2 items-center">
            <ThumbsUp
              className={cn(
                "h-[1.5rem] cursor-pointer",
                like ? "text-green-700" : "text-gray-300 hover:text-green-700",
              )}
              onClick={onLike}
            />
            <ThumbsDown
              className={cn(
                "h-[1.5rem] cursor-pointer",
                dislike ? "text-red-700" : "text-gray-300 hover:text-red-700",
              )}
              onClick={onDislike}
            />
            <form
              action="submit"
              className="flex flex-row w-full ml-2 items-center"
              onSubmit={handleSubmit}
            >
              <Input
                ref={feedbackRef}
                className="w-full"
                name="textFeedback"
                placeholder="Feedback"
              />
              <Button type="submit" className="ml-3" isPending={isPending}>
                Submit
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
