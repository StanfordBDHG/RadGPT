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
import { SendHorizonal } from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  feedback: z.string(),
});

interface FeedbackFormProps {
  textFeedback: string | null;
  onFeedbackSubmit: (feedback: string) => Promise<void>;
}

export const FeedbackForm = ({
  textFeedback,
  onFeedbackSubmit,
}: FeedbackFormProps) => {
  const form = useForm({
    formSchema,
    defaultValues: {
      feedback: textFeedback ?? "",
    },
  });

  const handleSubmit = form.handleSubmit(async ({ feedback }) => {
    try {
      await onFeedbackSubmit(feedback);
      toast.success("The feedback has been submitted, thank you!");
    } catch {
      toast.error("An error occurred while submitting the feedback!");
    }
  });

  return (
    <form className="flex w-full flex-row items-center" onSubmit={handleSubmit}>
      <Field
        control={form.control}
        name="feedback"
        className="w-full"
        checkEmptyError
        render={({ field }) => (
          <div className="relative">
            <Input placeholder="Feedback" {...field} />
            <Button
              type="submit"
              className="absolute right-0.5 top-0.5"
              size="sm"
              variant="ghost"
              isPending={form.formState.isSubmitting}
              aria-label="Submit feedback"
            >
              <SendHorizonal className="h-5 text-accent-foreground" />
            </Button>
          </div>
        )}
      />
    </form>
  );
};
