//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { Input } from "@stanfordspezi/spezi-web-design-system/components/Input";
import { Textarea } from "@stanfordspezi/spezi-web-design-system/components/Textarea";
import { Field, useForm } from "@stanfordspezi/spezi-web-design-system/forms";
import { useQuery } from "@tanstack/react-query";
import { ref, type StorageReference, uploadString } from "firebase/storage";
import { z } from "zod";
import { filesQueries } from "@/modules/files/queries";
import { storage } from "@/modules/firebase/app";
import { useAuthenticatedUser } from "@/modules/user";
import { calculateSHA256Hash } from "@/utils/crypto";

const formSchema = z.object({
  name: z.string().min(1, "Name of medical report is required"),
  content: z.string().min(1, "Content of medical report is required"),
});

interface FileCreationFormProps {
  onUploadSuccess: (ref: StorageReference, medicalReport: string) => void;
  onExistingFileUpload: (ref: StorageReference) => void;
}

export const FileCreationForm = ({
  onUploadSuccess,
  onExistingFileUpload,
}: FileCreationFormProps) => {
  const currentUser = useAuthenticatedUser();
  const { data: files } = useQuery(filesQueries.listFiles());
  const form = useForm({
    formSchema,
    defaultValues: {
      content: "",
      name: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (medicalReport) => {
    const contentHash = await calculateSHA256Hash(medicalReport.content);
    const existingFile = files?.find((file) => file.ref?.name === contentHash);

    if (existingFile) {
      if (existingFile.ref) {
        onExistingFileUpload(existingFile.ref);
      }
      return;
    }
    const storageReference = ref(
      storage,
      `users/${currentUser?.uid}/reports/${contentHash}`,
    );
    const result = await uploadString(
      storageReference,
      medicalReport.content,
      "raw",
      {
        contentType: "text/plain",
        customMetadata: { medicalReportName: medicalReport.name },
      },
    );
    onUploadSuccess(result.ref, medicalReport.content);
  });

  return (
    <form onSubmit={handleSubmit}>
      <Field
        control={form.control}
        name="name"
        label="Name"
        render={({ field }) => <Input {...field} />}
      />
      <Field
        control={form.control}
        name="content"
        label="Medical Report Content"
        render={({ field }) => <Textarea {...field} rows={10} />}
      />
      <Button type="submit" isPending={form.formState.isSubmitting}>
        Submit
      </Button>
    </form>
  );
};
