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
import { doc, updateDoc } from "firebase/firestore";
import { z } from "zod";
import { useAuthenticatedUser } from "@/modules/user";
import { firestore } from "@/utils/firebase";

const formSchema = z.object({
  medicalReportAnnotationsFeedback: z
    .string()
    .min(1, "Content for medical report feedback is required!"),
});

interface FeedbackFormProps {
  className: string;
  selectedFileName: string;
  feedback: string | null;
}

export const FeedbackForm = ({
  className,
  selectedFileName,
  feedback,
}: FeedbackFormProps) => {
  const currentUser = useAuthenticatedUser();
  const form = useForm({
    formSchema,
    values: {
      medicalReportAnnotationsFeedback: feedback ?? "",
    },
  });

  const handleSubmit = form.handleSubmit(
    async ({ medicalReportAnnotationsFeedback }) => {
      const path = `users/${currentUser?.uid}/${selectedFileName}/report_meta_data`;
      await updateDoc(doc(firestore, path), {
        user_feedback: medicalReportAnnotationsFeedback,
      });
      toast.success("The feedback has been submitted, thank you!");
    },
  );

  return (
    <div className={className}>
      <h1 className="mb-3 mt-5 text-xl">Feedback</h1>
      <form onSubmit={handleSubmit}>
        <Field
          control={form.control}
          name="medicalReportAnnotationsFeedback"
          render={({ field }) => <Textarea {...field} />}
        />
        <Button type="submit" isPending={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </div>
  );
};
