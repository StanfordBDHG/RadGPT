//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { Textarea } from "@stanfordspezi/spezi-web-design-system/components/Textarea";
import { Field, useForm } from "@stanfordspezi/spezi-web-design-system/forms";
import { ref, StorageReference, uploadString } from "firebase/storage";
import { z } from "zod";
import { storage } from "@utils/firebase";
import { Input } from "@stanfordspezi/spezi-web-design-system/components/Input";
import { useAuthenticatedUser } from "@/src/hooks/useAuthenticatedUser";

const formSchema = z.object({
  medicalReportContent: z
    .string()
    .min(1, "Content of medical report is required"),
  medicalReportName: z.string().min(1, "Name of medical report is required"),
});

// Source: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
const calculateSHA256Hash = async (data: string) => {
  const msgUint8 = new TextEncoder().encode(data);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

interface FileCreationFormProps {
  onUploadSuccess?: (ref: StorageReference) => void;
}

export default function FileCreationForm({
  onUploadSuccess,
}: FileCreationFormProps) {
  const currentUser = useAuthenticatedUser();
  const form = useForm({
    formSchema,
    defaultValues: {
      medicalReportContent: "",
      medicalReportName: "",
    },
  });

  const handleSubmit = form.handleSubmit(
    async ({ medicalReportContent, medicalReportName }) => {
      const medicalReportContentHash =
        await calculateSHA256Hash(medicalReportContent);
      const storageReference = ref(
        storage,
        `users/${currentUser?.uid}/reports/${medicalReportContentHash}`,
      );
      const custmoMetadata = { medicalReportName: medicalReportName };
      const result = await uploadString(
        storageReference,
        medicalReportContent,
        "raw",
        {
          contentType: "text/plain",
          customMetadata: custmoMetadata,
        },
      );
      if (onUploadSuccess) onUploadSuccess(result.ref);
    },
  );

  return (
    <form action="submit" onSubmit={handleSubmit}>
      <Field
        control={form.control}
        name="medicalReportName"
        label={"Name"}
        render={({ field }) => {
          return <Input type="text" {...field} />;
        }}
      />
      <Field
        control={form.control}
        name="medicalReportContent"
        label={"Medical Report Content"}
        render={({ field }) => {
          return <Textarea {...field} rows={10} />;
        }}
      />
      <Button type="submit" isPending={form.formState.isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
