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
import {
  Button,
  Field,
  Input,
  useForm,
} from "@stanfordbdhg/spezi-web-design-system";
import { ref, uploadBytes } from "firebase/storage";
import { z } from "zod";

const formSchema = z.object({
  filePath: z.string().min(1, "Medical report is required"),
});

const ProtectedComponent = () => {
  const currentUser = useAuthenticatedUser();
  const form = useForm({
    formSchema,
  });

  const handleSubmit = form.handleSubmit(async (_, e) => {
    const file = e?.target?.filePath?.files?.[0];
    const storageReference = ref(
      storage,
      `reports/${auth.currentUser?.uid}/${file.name}`,
    );
    await uploadBytes(storageReference, file);
  });

  return (
    <>
      <h1 className="text-3xl">Protected Screen</h1>
      <p className="text-s py-2">
        {currentUser?.email ?? "no user authenticated"}
      </p>
      <form action="submit" onSubmit={handleSubmit}>
        <Field
          control={form.control}
          name="filePath"
          label={"Medical Report"}
          render={({ field }) => {
            return <Input type="file" accept=".txt,.pdf" {...field} />;
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
