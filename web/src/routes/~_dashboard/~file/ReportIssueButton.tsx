//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { Button } from "@stanfordspezi/spezi-web-design-system/components/Button";
import { Checkbox } from "@stanfordspezi/spezi-web-design-system/components/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@stanfordspezi/spezi-web-design-system/components/Dialog";
import { Input } from "@stanfordspezi/spezi-web-design-system/components/Input";
import { SideLabel } from "@stanfordspezi/spezi-web-design-system/components/SideLabel";
import { toast } from "@stanfordspezi/spezi-web-design-system/components/Toaster";
import { Field, useForm } from "@stanfordspezi/spezi-web-design-system/forms";
import { useOpenState } from "@stanfordspezi/spezi-web-design-system/utils/useOpenState";
import { addDoc } from "firebase/firestore";
import { Flag } from "lucide-react";
import { z } from "zod";
import { collectionRefs, getCurrentUser } from "@/modules/firebase/app";

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
    .refine((userSelection) => userSelection.some((value) => value), {
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

export const ReportIssueButton = ({
  className,
  context,
}: ReportIssueButtonProps) => {
  const openState = useOpenState(false);

  const form = useForm({
    formSchema,
    defaultValues: {
      issueSelection: issueStrings.map(() => false),
      isOtherSelected: false,
      userInputedIssue: "",
    },
  });

  const handleClose = () => {
    openState.close();
    form.reset();
  };

  const handleSubmit = form.handleSubmit(async (medicalReport) => {
    const selectedIssueStrings = medicalReport.issueSelection
      .map((isUserSelected, index) =>
        isUserSelected ? issueStrings.at(index) : null,
      )
      .filter(Boolean);

    try {
      await addDoc(collectionRefs.usersReportedIssues(), {
        pre_defined_issues:
          selectedIssueStrings.length ? selectedIssueStrings : null,
        user_inputed_issue:
          medicalReport.userInputedIssue ?
            medicalReport.userInputedIssue
          : null,
        user_id: getCurrentUser().uid,
        context,
      });
      toast.success("The issue report has been submitted!");
    } catch {
      toast.error(
        "An error occurred while submitting the issue report! Please try again later.",
      );
    }

    handleClose();
  });

  return (
    <>
      <Dialog open={openState.isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-h-screen min-w-[25%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Report</DialogTitle>
            <DialogDescription>
              Please share additional details to help us better understand your
              issue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            {issueStrings.map((issue, index) => {
              const name = `issueSelection.${index}` as const;
              return (
                <Field
                  control={form.control}
                  key={name}
                  name={name}
                  checkEmptyError
                  render={({ field: { value, onChange, ...field } }) => (
                    <SideLabel>
                      <Checkbox
                        checked={value}
                        onCheckedChange={onChange}
                        {...field}
                      />
                      {issue}
                    </SideLabel>
                  )}
                />
              );
            })}
            <Field
              control={form.control}
              name="isOtherSelected"
              checkEmptyError
              render={({ field: { value, onChange, ...field } }) => (
                <SideLabel>
                  <Checkbox
                    checked={value}
                    onCheckedChange={onChange}
                    {...field}
                  />
                  Other:
                </SideLabel>
              )}
            />
            <Field
              control={form.control}
              name="userInputedIssue"
              className="mt-2"
              error={form.formState.errors.issueSelection?.root}
              render={({ field }) => (
                <Input
                  placeholder="specify other issues"
                  {...field}
                  onChange={(event) => {
                    const value = event.target.value;
                    form.setValue("isOtherSelected", value !== "");
                    field.onChange(event);
                  }}
                />
              )}
            />
            <Button type="submit" isPending={form.formState.isSubmitting}>
              Report
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Button
        variant="secondary"
        className={className}
        onClick={openState.open}
      >
        <Flag className="h-5" />
        Report issue
      </Button>
    </>
  );
};
