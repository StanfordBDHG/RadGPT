//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { toast } from "@stanfordspezi/spezi-web-design-system";
import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { Textarea } from "@stanfordspezi/spezi-web-design-system/components/Textarea";
import { Field, useForm } from "@stanfordspezi/spezi-web-design-system/forms";
import { updateDoc } from "firebase/firestore";
import { SendHorizonal } from "lucide-react";
import { z } from "zod";
import { type FileDetails } from "@/modules/files/queries";
import { docRefs, getCurrentUser } from "@/modules/firebase/app";

const formSchema = z.object({
  feedback: z
    .string()
    .min(1, "Content for medical report feedback is required!"),
});

interface FeedbackFormProps {
  file: FileDetails;
}

export const FeedbackForm = ({ file }: FeedbackFormProps) => {
  const form = useForm({
    formSchema,
    values: {
      feedback: file.user_feedback ?? "",
    },
  });

  const handleSubmit = form.handleSubmit(async ({ feedback }) => {
    const fileMetaDataRef = docRefs.fileMetaData({
      userId: getCurrentUser().uid,
      fileName: file.name,
    });
    await updateDoc(fileMetaDataRef, {
      user_feedback: feedback,
    });
    toast.success("The feedback has been submitted, thank you!");
  });

  return (
    <div className="mt-auto pt-8">
      <form onSubmit={handleSubmit}>
        <Field
          control={form.control}
          name="feedback"
          checkEmptyError
          render={({ field }) => (
            <div className="relative">
              <Textarea
                placeholder="Send us feedback"
                className="!min-h-10 pl-4 pr-24 placeholder:leading-[38px]"
                {...field}
              />
              <div className="flex-center absolute right-3 top-0 h-full">
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  isPending={form.formState.isSubmitting}
                  aria-label="Submit feedback"
                >
                  <SendHorizonal className="h-5 text-accent-foreground" />
                </Button>
              </div>
            </div>
          )}
        />
      </form>
    </div>
  );
};
