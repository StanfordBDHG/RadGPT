//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { useAuthenticatedUser } from "@/src/hooks/useAuthenticatedUser";
import { firestore } from "@/src/utils/firebase";
import { toast, Toaster } from "@stanfordspezi/spezi-web-design-system";
import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { Textarea } from "@stanfordspezi/spezi-web-design-system/components/Textarea";
import { Field, useForm } from "@stanfordspezi/spezi-web-design-system/forms";
import { doc, updateDoc } from "firebase/firestore";
import { z } from "zod";

const formSchema = z.object({
  medicalReportAnnotationsFeedback: z
    .string()
    .min(1, "Content for medical report feedback is required!"),
});

export default function FeedbackForm({
  className,
  selectedFileName,
  feedback,
}: {
  className: string;
  selectedFileName: string;
  feedback: string | null;
}) {
  const currentUser = useAuthenticatedUser();
  const form = useForm({
    formSchema,
    defaultValues: {
      medicalReportAnnotationsFeedback: "",
    },
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
    <>
      <Toaster />
      <div className={className}>
        <h1 className="text-xl mb-3 mt-5">Feedback</h1>
        <form action="submit" onSubmit={handleSubmit}>
          <Field
            control={form.control}
            name="medicalReportAnnotationsFeedback"
            render={({ field }) => {
              return <Textarea {...field} />;
            }}
          />
          <Button type="submit" isPending={form.formState.isSubmitting}>
            Submit
          </Button>
        </form>
      </div>
    </>
  );
}
