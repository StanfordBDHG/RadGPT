//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { type ComponentProps } from "react";
import { collectionRefs } from "@/modules/firebase/app";
import { MultiCheckboxFeedbackDialog } from "./MultiCheckboxFeedbackDialog";

const issueStrings = [
  "This content feels unsafe or upsetting",
  "I am confused by the information",
  "I feel like something important is missing",
  "I am not sure I understand the concept explanation",
  "I am not sure I understand the question explanation",
  "I am having trouble using this page",
];

type UserIssueDialogProps = Pick<
  ComponentProps<typeof MultiCheckboxFeedbackDialog>,
  "context" | "children"
>;

export const UserIssueDialog = (props: UserIssueDialogProps) => {
  return (
    <MultiCheckboxFeedbackDialog
      checkboxLabels={issueStrings}
      collectionReference={collectionRefs.usersReportedIssues()}
      title="Issue Report"
      description="Please share additional details to help us better understand your issue."
      submitButtonText="Report"
      toastSuccessText="The issue report has been submitted!"
      toastFailureText="An error occurred while submitting the issue report! Please try again later."
      {...props}
    />
  );
};
