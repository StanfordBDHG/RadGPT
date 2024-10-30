//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth, storage } from "@utils/firebase.ts";
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";
import { ref, uploadString } from "firebase/storage";
import { z } from "zod";
import { Field, useForm } from "@stanfordspezi/spezi-web-design-system/forms";
import { Input } from "@stanfordspezi/spezi-web-design-system/components/Input";
import { Textarea } from "@stanfordspezi/spezi-web-design-system/components/Textarea";
import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";

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

const ProtectedComponent = () => {
  const currentUser = useAuthenticatedUser();
  const form = useForm({
    formSchema,
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
      await uploadString(storageReference, medicalReportContent, "raw", {
        contentType: "text/plain",
        customMetadata: custmoMetadata,
      });
    },
  );

  return (
    <>
      <h1 className="text-3xl">Protected Screen</h1>
      <p className="text-s py-2">
        {currentUser?.email ?? "no user authenticated"}
      </p>
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
            return <Textarea {...field} />;
          }}
        />
        <Button type="submit" isPending={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </>
  );
};

export const Route = createFileRoute("/protected_page")({
  component: ProtectedComponent,
  beforeLoad: async ({ location }) => {
    await auth.authStateReady();
    if (!auth.currentUser)
      throw redirect({
        to: "/",
        search: {
          redirect: location.href,
        },
      });
  },
});
