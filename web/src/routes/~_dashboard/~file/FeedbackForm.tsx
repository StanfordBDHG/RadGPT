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
import { z } from "zod";
import { type FileDetails } from "@/modules/files/queries";
import { docRefs, getCurrentUser } from "@/modules/firebase/app";

const formSchema = z.object({
  feedback: z
    .string()
    .min(1, "Content for medical report feedback is required!"),
});

interface FeedbackFormProps {
  className: string;
  file: FileDetails;
}

export const FeedbackForm = ({ className, file }: FeedbackFormProps) => {
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
    <div className={className}>
      <h1 className="mb-3 mt-5 text-xl">Feedback</h1>
      <form onSubmit={handleSubmit}>
        <Field
          control={form.control}
          name="feedback"
          render={({ field }) => <Textarea {...field} />}
        />
        <Button type="submit" isPending={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </div>
  );
};
