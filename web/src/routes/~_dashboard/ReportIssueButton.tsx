//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { Checkbox } from "@stanfordspezi/spezi-web-design-system/components/Checkbox";
import { Input } from "@stanfordspezi/spezi-web-design-system/components/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@stanfordspezi/spezi-web-design-system/components/Dialog";
import { Field, useForm } from "@stanfordspezi/spezi-web-design-system/forms";
import { SideLabel } from "@stanfordspezi/spezi-web-design-system/components/SideLabel";
import { cn } from "@stanfordspezi/spezi-web-design-system/utils/className";
import { useOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { Flag } from "lucide-react";
import { z } from "zod";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { firestore, getCurrentUser } from "@/modules/firebase/app";
import { toast } from "@stanfordspezi/spezi-web-design-system/components/Toaster";

const issueStrings = [
  "The content is dangerous or harmful",
  "The content is inaccurate or misleading",
  "Important details or key words are missing",
  "The explanations or follow-up questions are unclear",
  "I'm experiencing technical issues",
];
const justPredefinedIssuesSchema = z.object({
  issueSelection: z
    .array(z.boolean())
    .length(issueStrings.length)
    .refine((userSelection) => userSelection.some((value) => value === true), {
      message: "At least one issue has to be selected",
    }),
  isOtherSelected: z.literal(false),
  userInputedIssue: z.string(),
});
const otherSelectedSchema = z.object({
  issueSelection: z.array(z.boolean()).length(issueStrings.length),
  isOtherSelected: z.literal(true),
  userInputedIssue: z
    .string()
    .min(1, { message: "Please specify the issue in more detail" }),
});

const formSchema = z.union([justPredefinedIssuesSchema, otherSelectedSchema]);

interface UserIssueContext {
  reportID: string;
  observationIndex?: number;
  explanation?: boolean;
  questionIndex?: number;
}

interface ReportIssueButtonProps {
  className?: string;
  context: UserIssueContext;
}

export function ReportIssueButton({
  className,
  context,
}: ReportIssueButtonProps) {
  const openState = useOpenState(false);
  const defaultValues = {
    issueSelection: new Array(issueStrings.length).fill(false),
    isOtherSelected: false,
    userInputedIssue: "",
  };

  const form = useForm({
    formSchema,
    defaultValues: defaultValues,
  });
  const [otherExpanded, setOtherExpanded] = useState(false);

  const handleSubmit = form.handleSubmit(async (medicalReport) => {
    const selectedIssueStrings = medicalReport.issueSelection
      .map((isUserSelected, index) =>
        isUserSelected ? issueStrings[index] : null,
      )
      .filter((val) => val !== null);

    if (
      selectedIssueStrings ||
      (medicalReport.isOtherSelected && medicalReport.userInputedIssue)
    ) {
      let issueContent = {};
      if (selectedIssueStrings) {
        issueContent = {
          ...issueContent,
          pre_defined_issues: selectedIssueStrings,
        };
      }
      if (medicalReport.isOtherSelected) {
        issueContent = {
          ...issueContent,
          user_inputed_issue: medicalReport.userInputedIssue,
        };
      }

      const collectionReference = collection(
        firestore,
        "users_reported_issues",
      );
      try {
        await addDoc(collectionReference, {
          ...issueContent,
          user_id: getCurrentUser().uid,
          context: context,
        });
        toast.success("The issue report has been submitted!");
      } catch {
        toast.error(
          "An error occurred while submitting the issue report! Please try again later.",
        );
      }
    }

    openState.close();
    form.reset(defaultValues);
    setOtherExpanded(false);
  });

  return (
    <>
      <Dialog open={openState.isOpen} onOpenChange={openState.close}>
        <DialogContent className="max-h-screen min-w-[25%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Report</DialogTitle>
            <DialogDescription>
              Please give a bit more context so we can understand the issue in
              more detail.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            {issueStrings.map((item, index) => (
              <Field
                control={form.control}
                key={`issueSelection.${index}`}
                name={`issueSelection.${index}`}
                checkEmptyError={true}
                render={({ field: { value, onChange, ...field } }) => (
                  <SideLabel>
                    <Checkbox
                      checked={value}
                      onCheckedChange={onChange}
                      {...field}
                    />
                    {item}
                  </SideLabel>
                )}
              />
            ))}
            <Field
              control={form.control}
              name="isOtherSelected"
              checkEmptyError={true}
              render={({ field: { value, onChange, ...field } }) => (
                <SideLabel>
                  <Checkbox
                    checked={otherExpanded}
                    onCheckedChange={(event) => {
                      setOtherExpanded(event === true);
                      onChange(event);
                    }}
                    {...field}
                  />
                  Other (please specify):
                </SideLabel>
              )}
            />

            <Field
              control={form.control}
              name="userInputedIssue"
              render={({ field }) => (
                <Input disabled={!otherExpanded} {...field} />
              )}
            />

            <Button type="submit" isPending={form.formState.isSubmitting}>
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Button
        variant={"secondary"}
        className={className}
        onClick={() => openState.open()}
      >
        <Flag className={cn("h-5 transition")} />
        Report issue
      </Button>
    </>
  );
}
